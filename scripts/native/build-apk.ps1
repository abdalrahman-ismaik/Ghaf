#Requires -Version 7.0
# Internal rehearsal only. Default preflight never generates Android or starts Gradle.
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$ProjectRoot,
    [Parameter(Mandatory)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedHead,
    [Parameter(Mandatory)][string]$SdkRoot,
    [Parameter(Mandatory)][string]$JdkHome,
    [Parameter(Mandatory)][string]$GradleUserHome,
    [Parameter(Mandatory)][string]$OutputDirectory,
    [Parameter(Mandatory)][string]$MessagingEnvFile,
    [switch]$Build,
    [switch]$AllowDependencyDownloads
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$templateKeySha = '221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58'
$gradleDistributionSha = 'b266d5ff6b90eada6dc3b20cb090e3731302e553a27c5d3e4df1f0d76beaff06'
$runDirectory = $null
$buildLock = $null
$receipt = [ordered]@{
    schemaVersion = 1; startedUtc = [DateTime]::UtcNow.ToString('o')
    mode = $(if ($Build) { 'build' } else { 'preflight' }); status = 'FAILED'
    sourceHead = $ExpectedHead; signing = 'unchanged Expo template debug identity; internal rehearsal only'
    physicalAcceptance = 'NOT RUN'; resourceMonitoring = 'Windows operator policy 2026-09-14: admission requires at least 3 GiB available physical memory, one heavy job, JVM1536MiB/metaspace512MiB/Node1024MiB/Metro1/Ninja1. Root monitors memory/processes and stops the owned build if available memory below 1 GiB persists or system pressure rises. Launcher records snapshots only; no automatic watchdog or inherited Linux acceptance.'
    originalSource = 'C: workspace retained; selected D: workspace and outputs are disposable'
    steps = [System.Collections.Generic.List[object]]::new()
}

function Resolve-InputPath([string]$Value, [switch]$File) {
    if (-not [IO.Path]::IsPathFullyQualified($Value) -or $Value -match '[\r\n"&|<>^%!]' -or $Value.StartsWith('\\')) {
        throw 'Inputs must be explicit local absolute paths without shell metacharacters.'
    }
    $item = Get-Item -LiteralPath $Value
    if ($item.PSIsContainer -eq $File.IsPresent) { throw 'An input has the wrong file/directory kind.' }
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Linked input paths are not accepted.' }
    $parent = if ($item.PSIsContainer) { $item } else { $item.Directory }
    for (; $null -ne $parent; $parent = $parent.Parent) {
        if ($parent.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Linked input paths are not accepted.' }
    }
    return $item.FullName.TrimEnd('\')
}

function Hash-File([string]$Path) { return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() }
function In-Directory([string]$Path, [string]$Directory) {
    return $Path.StartsWith($Directory.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)
}
function Git-Read([string[]]$Arguments) {
    $value = & $script:gitExe -c "safe.directory=$($ProjectRoot.Replace('\', '/'))" -C $ProjectRoot @Arguments 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Read-only Git identity inspection failed.' }
    return ($value -join "`n").Trim()
}

function Assert-Source {
    if ((Git-Read @('rev-parse', 'HEAD')) -cne $ExpectedHead) { throw 'HEAD differs from ExpectedHead.' }
    $actualRoot = (Git-Read @('rev-parse', '--show-toplevel')).Replace('/', '\')
    if ($actualRoot -ine $ProjectRoot) { throw 'Git root differs from ProjectRoot.' }
    if (Git-Read @('diff', '--name-only', 'HEAD', '--', '.', ':!package.json')) { throw 'Tracked source differs from ExpectedHead.' }
    $committed = (Git-Read @('show', 'HEAD:package.json')) | ConvertFrom-Json -AsHashtable
    $installed = Get-Content -LiteralPath (Join-Path $ProjectRoot 'package.json') -Raw | ConvertFrom-Json -AsHashtable
    foreach ($name in @('android', 'ios')) {
        if ($installed.scripts[$name] -notin @($committed.scripts[$name], "expo run:$name")) { throw 'Unexpected package script modification.' }
        $installed.scripts[$name] = $committed.scripts[$name]
    }
    if (($installed | ConvertTo-Json -Depth 50 -Compress) -cne ($committed | ConvertTo-Json -Depth 50 -Compress)) {
        throw 'Package changes exceed Expo android/ios script normalization.'
    }
    $untracked = Git-Read @('ls-files', '--others', '--exclude-standard')
    if ($untracked) { throw 'Untracked nonignored source requires integration-owner review.' }
}

function Read-Headroom([switch]$SnapshotOnly) {
    $os = Get-CimInstance Win32_OperatingSystem
    $available = [long]$os.FreePhysicalMemory * 1KB
    $total = [long]$os.TotalVisibleMemorySize * 1KB
    if ($total -le 0 -or (-not $SnapshotOnly -and $available -lt 3GB)) {
        throw 'Windows build admission requires at least 3 GiB physical memory available.'
    }
    $writableVolumes = @(@($ProjectRoot, $GradleUserHome, $OutputDirectory) | ForEach-Object { [IO.Path]::GetPathRoot($_) } | Sort-Object -Unique)
    $toolVolumes = @(@($SdkRoot, $JdkHome) | ForEach-Object { [IO.Path]::GetPathRoot($_) } | Sort-Object -Unique)
    $disks = foreach ($volume in @($writableVolumes + $toolVolumes | Sort-Object -Unique)) {
        $drive = [IO.DriveInfo]::new($volume)
        if (-not $drive.IsReady) { throw 'A selected volume is unavailable.' }
        $writesHere = $volume -in $writableVolumes
        if ($writesHere -and $drive.AvailableFreeSpace -lt 20GB) { throw 'Writable source/cache/output volumes need at least 20 GiB free.' }
        [ordered]@{
            root = $drive.Name; freeBytes = $drive.AvailableFreeSpace
            access = $(if ($writesHere) { 'build/cache/output/temp' } else { 'read-only toolchain' })
            requiredFreeBytes = $(if ($writesHere) { 20GB } else { 0 })
        }
    }
    return [ordered]@{ utc = [DateTime]::UtcNow.ToString('o'); availableBytes = $available; totalBytes = $total; disks = $disks }
}

function Invoke-Recorded([string]$Name, [string]$Executable, [string[]]$Arguments) {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.WorkingDirectory = Join-Path $ProjectRoot 'android'
    $info.UseShellExecute = $false; $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true; $info.RedirectStandardError = $true
    $info.Environment.Clear()
    foreach ($key in $script:childEnvironment.Keys) { $info.Environment[$key] = $script:childEnvironment[$key] }
    if ([IO.Path]::GetExtension($Executable) -in @('.bat', '.cmd')) {
        $tokens = @($Executable) + $Arguments
        foreach ($token in $tokens) { if ($token -match '[\r\n"&|<>^%!]') { throw 'Unsafe batch command argument.' } }
        $info.FileName = $script:commandExe
        $info.Arguments = '/d /s /c "' + (($tokens | ForEach-Object { '"' + $_ + '"' }) -join ' ') + '"'
    } else {
        $info.FileName = $Executable
        foreach ($argument in $Arguments) { $info.ArgumentList.Add($argument) }
    }
    $stdoutPath = Join-Path $runDirectory "$Name.stdout.log"
    $stderrPath = Join-Path $runDirectory "$Name.stderr.log"
    $step = [ordered]@{ name = $Name; startedUtc = [DateTime]::UtcNow.ToString('o'); stdout = $stdoutPath; stderr = $stderrPath }
    $receipt.steps.Add($step)
    $process = [Diagnostics.Process]::new(); $process.StartInfo = $info
    # Keep redirected progress visible during long tasks instead of buffering the final lines.
    $stdout = [IO.FileStream]::new($stdoutPath, [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::Read, 1)
    $stderr = [IO.FileStream]::new($stderrPath, [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::Read, 1)
    try {
        if (-not $process.Start()) { throw 'Process did not start.' }
        $step.pid = $process.Id
        $copyOut = $process.StandardOutput.BaseStream.CopyToAsync($stdout)
        $copyError = $process.StandardError.BaseStream.CopyToAsync($stderr)
        $process.WaitForExit()
        $null = $copyOut.GetAwaiter().GetResult()
        $null = $copyError.GetAwaiter().GetResult()
        $step.exitCode = $process.ExitCode; $step.finishedUtc = [DateTime]::UtcNow.ToString('o')
        if ($process.ExitCode -ne 0) { throw "Step $Name failed; inspect its retained logs." }
    } finally { $stdout.Dispose(); $stderr.Dispose(); $process.Dispose() }
    return (Get-Content -LiteralPath $stdoutPath -Raw) + (Get-Content -LiteralPath $stderrPath -Raw)
}

try {
    if (-not $IsWindows) { throw 'This launcher requires Windows and PowerShell 7.' }
    $ProjectRoot = Resolve-InputPath $ProjectRoot
    $SdkRoot = Resolve-InputPath $SdkRoot
    $JdkHome = Resolve-InputPath $JdkHome
    $GradleUserHome = Resolve-InputPath $GradleUserHome
    $OutputDirectory = Resolve-InputPath $OutputDirectory
    $MessagingEnvFile = Resolve-InputPath $MessagingEnvFile -File
    $boundary = Split-Path -Parent $ProjectRoot
    if (-not (In-Directory $boundary 'D:\GhafNative') -or (Split-Path -Leaf $ProjectRoot) -ne 'source') {
        throw 'ProjectRoot must be the selected disposable D:\GhafNative\<run>\source worktree.'
    }
    foreach ($path in @($SdkRoot, $GradleUserHome, $OutputDirectory)) {
        if (-not (In-Directory $path $boundary) -or (In-Directory $path $ProjectRoot) -or $path -ieq $ProjectRoot) {
            throw 'SDK, Gradle cache and output must be separate siblings inside the selected D: run.'
        }
    }
    foreach ($left in @($SdkRoot, $GradleUserHome, $OutputDirectory)) {
        foreach ($right in @($SdkRoot, $GradleUserHome, $OutputDirectory)) {
            if ($left -ine $right -and (In-Directory $left $right)) { throw 'Tool/cache/output directories cannot contain one another.' }
        }
    }
    $separateDirectories = @($SdkRoot, $GradleUserHome, $OutputDirectory)
    if (@($separateDirectories | Select-Object -Unique).Count -ne 3) { throw 'Tool/cache/output directories must be distinct.' }
    $runDirectory = Join-Path $OutputDirectory ((Get-Date -AsUTC -Format 'yyyyMMddTHHmmssfffZ') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8))
    New-Item -ItemType Directory -Path $runDirectory | Out-Null
    $receipt.paths = @{ project = $ProjectRoot; sdk = $SdkRoot; jdk = $JdkHome; gradleCache = $GradleUserHome; output = $runDirectory }
    $receipt.launcherSha256 = Hash-File $PSCommandPath
    $script:gitExe = (Get-Command git.exe -CommandType Application).Source
    $nodeExe = (Get-Command node.exe -CommandType Application).Source
    $receipt.node = @{ path = $nodeExe; sha256 = (Hash-File $nodeExe) }
    $script:commandExe = Join-Path $env:SystemRoot 'System32\cmd.exe'
    Assert-Source
    foreach ($directory in @('android', 'node_modules')) { $null = Resolve-InputPath (Join-Path $ProjectRoot $directory) }
    $required = @{
        java = "$JdkHome\bin\java.exe"; javac = "$JdkHome\bin\javac.exe"; keytool = "$JdkHome\bin\keytool.exe"
        aapt = "$SdkRoot\build-tools\36.0.0\aapt.exe"; apksigner = "$SdkRoot\build-tools\36.0.0\apksigner.bat"
        aapt35 = "$SdkRoot\build-tools\35.0.0\aapt.exe"; cmake = "$SdkRoot\cmake\3.30.5\bin\cmake.exe"
        ninja = "$SdkRoot\cmake\3.30.5\bin\ninja.exe"; clang = "$SdkRoot\ndk\27.1.12297006\toolchains\llvm\prebuilt\windows-x86_64\bin\clang.exe"
        platform = "$SdkRoot\platforms\android-36\android.jar"; lock = "$ProjectRoot\package-lock.json"
        installedLock = "$ProjectRoot\node_modules\.package-lock.json"; template = "$ProjectRoot\node_modules\expo\template.tgz"
        appGradle = "$ProjectRoot\android\app\build.gradle"; wrapper = "$ProjectRoot\android\gradle\wrapper\gradle-wrapper.properties"
        keystore = "$ProjectRoot\android\app\debug.keystore"; nativePolicySource = "$ProjectRoot\scripts\native\build-apk.sh"
    }
    $receipt.inputSha256 = @{}
    foreach ($entry in $required.GetEnumerator()) {
        $null = Resolve-InputPath $entry.Value -File
        $receipt.inputSha256[$entry.Key] = Hash-File $entry.Value
    }
    if ($receipt.inputSha256.keystore -ne $templateKeySha) { throw 'The generated signing key differs from the approved Expo template.' }
    $wrapper = Get-Content -LiteralPath $required.wrapper -Raw
    if ($wrapper -notmatch '(?m)^distributionUrl=https\\://services\.gradle\.org/distributions/gradle-9\.3\.1-bin\.zip\s*$') { throw 'Expected Gradle wrapper 9.3.1.' }
    $distribution = @(Get-ChildItem -Path "$GradleUserHome\wrapper\dists\gradle-9.3.1-bin\*\gradle-9.3.1\bin\gradle.bat" -File)
    if ($distribution.Count -ne 1) { throw 'Provision exactly one existing Gradle 9.3.1 wrapper-cache distribution; the launcher never downloads Gradle.' }
    $gradleExe = Resolve-InputPath $distribution[0].FullName -File
    $receipt.gradle = @{ path = $gradleExe; launcherSha256 = (Hash-File $gradleExe); expectedDistributionSha256 = $gradleDistributionSha; distributionProvenance = 'Operator-provisioned cache; publisher ZIP checksum must be evidenced separately if ZIP is absent' }
    $gradleZip = Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $gradleExe))) 'gradle-9.3.1-bin.zip'
    if (Test-Path -LiteralPath $gradleZip -PathType Leaf) {
        if ((Hash-File $gradleZip) -ne $gradleDistributionSha) { throw 'Cached Gradle ZIP checksum differs from its publisher checksum.' }
        $receipt.gradle.distributionProvenance = 'Cached ZIP matches publisher SHA-256'
    }
    foreach ($component in @('build-tools\35.0.0', 'build-tools\36.0.0', 'ndk\27.1.12297006', 'cmake\3.30.5')) {
        $version = Split-Path -Leaf $component
        if ((Get-Content -LiteralPath "$SdkRoot\$component\source.properties" -Raw) -notmatch "(?m)^Pkg.Revision\s*=\s*$([regex]::Escape($version))\s*$") { throw 'SDK component revision mismatch.' }
    }
    if ((Get-Content -LiteralPath "$SdkRoot\platforms\android-36\source.properties" -Raw) -notmatch '(?m)^AndroidVersion.ApiLevel\s*=\s*36\s*$') { throw 'Android platform 36 is required.' }
    if (-not (Test-Path -LiteralPath "$SdkRoot\licenses\android-sdk-license" -PathType Leaf)) { throw 'Existing accepted SDK license record is required.' }
    $appGradle = Get-Content -LiteralPath $required.appGradle -Raw
    if ($appGradle -notmatch 'extraPackagerArgs\s*=\s*\[\s*["'']--max-workers["'']\s*,\s*["'']1["'']\s*\]' -or $appGradle -notmatch 'signingConfig\s+signingConfigs.debug') {
        throw 'Existing Android must retain template debug signing and an explicit Metro max-workers=1 policy.'
    }
    $messaging = @{}
    foreach ($line in (Get-Content -LiteralPath $MessagingEnvFile)) {
        $line = $line.Trim()
        if (-not $line -or $line.StartsWith('#')) { continue }
        if ($line -notmatch '^(EXPO_PUBLIC_GHAF_MESSAGING_URL|EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY)=(\S+)$' -or $messaging.ContainsKey($Matches[1])) {
            throw 'MessagingEnvFile may contain only one unquoted URL and one public publishable key; no secrets or feature flags.'
        }
        $messaging[$Matches[1]] = $Matches[2]
    }
    if ($messaging.Count -ne 2 -or $messaging.EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY -notmatch '^sb_publishable_[A-Za-z0-9_-]+$') { throw 'Both public messaging inputs are required.' }
    $endpoint = $null
    if (-not [Uri]::TryCreate($messaging.EXPO_PUBLIC_GHAF_MESSAGING_URL, [UriKind]::Absolute, [ref]$endpoint) -or
        $endpoint.Scheme -ne 'https' -or $endpoint.UserInfo -or $endpoint.Query -or $endpoint.Fragment -or $endpoint.AbsolutePath -ne '/' -or -not $endpoint.IsDefaultPort) {
        throw 'Messaging URL must be an HTTPS project origin without credentials, path, port, query or fragment.'
    }
    $flags = @{
        EXPO_PUBLIC_GHAF_SERVICE_MODE = 'mock'; EXPO_PUBLIC_GHAF_AUTH_MODE = 'demo'; EXPO_PUBLIC_GHAF_DEMO_ENTRY = 'true'
        EXPO_PUBLIC_GHAF_AI_PARENT_TASK_DRAFTING_LIVE = 'false'; EXPO_PUBLIC_GHAF_AI_CHILD_COACH_TEXT_LIVE = 'false'; EXPO_PUBLIC_GHAF_AI_CHILD_COACH_VOICE_LIVE = 'false'
    }
    $script:childEnvironment = @{
        SystemRoot = $env:SystemRoot; WINDIR = $env:SystemRoot; ComSpec = $commandExe
        PATH = "$JdkHome\bin;$(Split-Path -Parent $nodeExe);$env:SystemRoot\System32;$env:SystemRoot"
        PATHEXT = '.COM;.EXE;.BAT;.CMD'; USERPROFILE = $env:USERPROFILE
        APPDATA = "$GradleUserHome\appdata"; LOCALAPPDATA = "$GradleUserHome\localappdata"
        JAVA_HOME = $JdkHome; ANDROID_HOME = $SdkRoot; ANDROID_SDK_ROOT = $SdkRoot; GRADLE_USER_HOME = $GradleUserHome
        TEMP = $runDirectory; TMP = $runDirectory; ANDROID_USER_HOME = $GradleUserHome
        __UNSAFE_EXPO_HOME_DIRECTORY = "$GradleUserHome\expo"; npm_config_cache = "$GradleUserHome\npm-cache"; npm_config_offline = 'true'
        CI = '1'; EXPO_NO_TELEMETRY = '1'; EXPO_NO_DOTENV = '1'; EXPO_OFFLINE = '1'
        NODE_OPTIONS = '--max-old-space-size=1024'; CMAKE_BUILD_PARALLEL_LEVEL = '1'; GRADLE_OPTS = '-Dorg.gradle.daemon=false'
    }
    foreach ($entry in $flags.GetEnumerator()) { $childEnvironment[$entry.Key] = $entry.Value }
    foreach ($entry in $messaging.GetEnumerator()) { $childEnvironment[$entry.Key] = $entry.Value }
    # Bind bundle reuse to the actual public child environment without logging its key value.
    [string[]]$publicConfigKeys = @($childEnvironment.Keys | Where-Object { $_.StartsWith('EXPO_PUBLIC_', [StringComparison]::Ordinal) })
    [Array]::Sort($publicConfigKeys, [StringComparer]::Ordinal)
    $publicConfiguration = [ordered]@{}
    foreach ($key in $publicConfigKeys) { $publicConfiguration[$key] = $childEnvironment[$key] }
    $publicConfigBytes = [Text.Encoding]::UTF8.GetBytes(($publicConfiguration | ConvertTo-Json -Compress))
    $configHasher = [Security.Cryptography.SHA256]::Create()
    try { $publicConfigHash = [BitConverter]::ToString($configHasher.ComputeHash($publicConfigBytes)).Replace('-', '').ToLowerInvariant() }
    finally { $configHasher.Dispose() }
    $receipt.publicBundleConfigSha256 = $publicConfigHash
    $receipt.flags = $flags
    $receipt.entrySelection = 'Explicit 2026-09-14 three-account competition rehearsal; demo authentication and prepared AI retained'
    $receipt.temporaryStorage = @{ temp = $runDirectory; appdata = $childEnvironment.APPDATA; localappdata = $childEnvironment.LOCALAPPDATA; expoHome = $childEnvironment.__UNSAFE_EXPO_HOME_DIRECTORY; npmCache = $childEnvironment.npm_config_cache; jdkVolumeWrites = 'none requested' }
    $receipt.messaging = @{ endpoint = $endpoint.GetLeftPart([UriPartial]::Authority); publicConfigSha256 = (Hash-File $MessagingEnvFile); authority = 'Dedicated messaging configuration only; account/session and backend acceptance are separate evidence' }
    $receipt.resources = @{ gradleWorkers = 1; javaHeapMiB = 1536; metaspaceMiB = 512; nodeHeapMiB = 1024; metroWorkers = 1; ninjaSharedPoolDepth = 1; abi = 'arm64-v8a'; dependencyDownloads = $AllowDependencyDownloads.IsPresent }
    $receipt.headroomBefore = Read-Headroom
    $javaVersion = Invoke-Recorded 'java-version' $required.java @('-version')
    if ($javaVersion -notmatch 'version "17\.') { throw 'JDK 17 is required.' }
    $receipt.javaVersion = $javaVersion.Trim()
    $receipt.javacVersion = (Invoke-Recorded 'javac-version' $required.javac @('-version')).Trim()
    if ($receipt.javacVersion -notmatch '^javac 17\.') { throw 'Javac 17 is required.' }
    $receipt.nodeVersion = (Invoke-Recorded 'node-version' $nodeExe @('--version')).Trim()
    $receipt.cmakeVersion = (Invoke-Recorded 'cmake-version' $required.cmake @('--version')).Trim()
    if ($receipt.cmakeVersion -notmatch '^cmake version 3\.30\.5') { throw 'CMake executable revision mismatch.' }
    $receipt.ninjaVersion = (Invoke-Recorded 'ninja-version' $required.ninja @('--version')).Trim()
    $receipt.clangVersion = (Invoke-Recorded 'ndk-clang-version' $required.clang @('--version')).Trim()

    # Reuse the reviewed pool mechanism with explicit Windows roots and canonical path comparison.
    $linuxPolicy = Get-Content -LiteralPath $required.nativePolicySource -Raw
    $policyMatch = [regex]::Match($linuxPolicy, "(?s)<<'GRADLE_NATIVE_POOL'[^\r\n]*\r?\n(.*?)\r?\nGRADLE_NATIVE_POOL")
    if (-not $policyMatch.Success) { throw 'Reviewed Ninja policy block is unavailable.' }
    $policy = $policyMatch.Groups[1].Value
    $headerRead = "def header = new JsonSlurper().parseText(receipt.withReader('UTF-8') { it.readLine() })"
    if (-not $policy.Contains($headerRead)) { throw 'Reviewed receipt header reader changed.' }
    # Windows locks exclude a second reader handle; use the already locked channel.
    $windowsHeaderRead = @'
def headerBuffer = ByteBuffer.allocate(4096)
                channel.position(0L)
                while (headerBuffer.hasRemaining() && channel.read(headerBuffer) > 0) {}
                headerBuffer.flip()
                def headerText = java.nio.charset.StandardCharsets.UTF_8.decode(headerBuffer).toString()
                def headerEnd = headerText.indexOf('\n')
                if (headerEnd < 0) throw new GradleException('Native policy receipt header exceeds its bounded reader.')
                def header = new JsonSlurper().parseText(headerText.substring(0, headerEnd))
'@
    $policy = $policy.Replace($headerRead, $windowsHeaderRead)
    $oldOutput = '/home/smyk/projects/Ghaf-demo-systems/output/native-build'
    $oldAndroid = '/home/smyk/projects/Ghaf-demo-systems/android'
    foreach ($anchor in @($oldOutput, $oldAndroid)) {
        if ([regex]::Matches($policy, [regex]::Escape($anchor)).Count -ne 1) { throw 'Reviewed Ninja policy roots changed; manual reconciliation required.' }
    }
    if ($OutputDirectory.Contains("'") -or $ProjectRoot.Contains("'")) { throw 'Groovy boundary paths cannot contain single quotes.' }
    $rootComparison = "if (buildRoot == '$oldAndroid')"
    if (-not $policy.Contains($rootComparison)) { throw 'Reviewed native root comparison changed.' }
    $policy = $policy.Replace($rootComparison, "if (new File(buildRoot).canonicalFile == new File('$oldAndroid').canonicalFile)")
    $policy = $policy.Replace($oldOutput, $OutputDirectory.Replace('\', '/')).Replace($oldAndroid, "$($ProjectRoot.Replace('\', '/'))/android")
    $bundleConfigPolicy = @'
def ghafPublicBundleConfigSha = System.getProperty('ghaf.publicBundleConfigSha')
if (!(ghafPublicBundleConfigSha ==~ /[0-9a-f]{64}/)) {
    throw new GradleException('Missing public bundle configuration identity.')
}
gradle.beforeProject { p ->
    if (p.path == ':app') {
        p.pluginManager.withPlugin('com.facebook.react') {
            p.tasks.matching { it.name == 'createBundleReleaseJsAndAssets' }.configureEach { task ->
                task.inputs.property('ghafPublicBundleConfigSha256', ghafPublicBundleConfigSha)
                record([status: 'bundle_config_bound', task: task.path,
                        public_config_sha256: ghafPublicBundleConfigSha])
            }
        }
    }
}
'@
    $policy += "`n" + $bundleConfigPolicy + "`n"
    $initFile = Join-Path $runDirectory 'native-one-job.init.gradle'
    [IO.File]::WriteAllText($initFile, $policy, [Text.UTF8Encoding]::new($false))
    $policyHash = Hash-File $initFile
    $policyReceipt = Join-Path $runDirectory 'native-module-policy.jsonl'
    @{ schema_version = 1; policy = 'ninja-shared-pool-v1'; init_sha256 = $policyHash; source_commit = $ExpectedHead; head = $ExpectedHead; pool = 'ghaf_native'; depth = 1 } |
        ConvertTo-Json -Compress | Set-Content -LiteralPath $policyReceipt -Encoding utf8NoBOM
    $receipt.nativePolicySha256 = $policyHash
    $receipt.nativePolicyAcceptance = 'Requested final DSL coverage; generated Ninja edges and compiler process coverage remain operator review'
    if (-not $Build) {
        $receipt.status = 'PREFLIGHT PASSED'
        Write-Host "Preflight passed. Build and device acceptance NOT RUN. Receipt: $runDirectory"
        return
    }
    $buildLock = [IO.File]::Open((Join-Path $GradleUserHome 'ghaf-windows-build.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    Assert-Source
    $receipt.headroomAtBuild = Read-Headroom
    $arguments = @(':app:assembleRelease', '--no-daemon', '--no-parallel', '--no-configuration-cache', '--max-workers=1', '--console=plain',
        '-PreactNativeArchitectures=arm64-v8a', '-Pandroid.cmakeVersion=3.30.5', '-Pandroid.builder.sdkDownload=false',
        '-Pkotlin.compiler.execution.strategy=in-process', "-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8 -Djava.io.tmpdir=$runDirectory",
        '--init-script', $initFile, "-Dghaf.nativePolicyReceipt=$policyReceipt", "-Dghaf.nativePolicyInitSha=$policyHash",
        "-Dghaf.publicBundleConfigSha=$publicConfigHash")
    if (-not $AllowDependencyDownloads) { $arguments += '--offline' }
    $receipt.gradleArguments = $arguments
    $null = Invoke-Recorded 'gradle-release' $gradleExe $arguments
    Assert-Source
    $receipt.headroomAfter = Read-Headroom -SnapshotOnly
    $coverage = @(Get-Content -LiteralPath $policyReceipt | ForEach-Object { $_ | ConvertFrom-Json -AsHashtable } | Where-Object { $_.ContainsKey('status') -and $_.status -eq 'coverage_verified' })
    if ($coverage.Count -ne 1) { throw 'Final Gradle module coverage was not verified.' }
    $receipt.nativeModules = $coverage[0].native_modules
    $apk = Resolve-InputPath "$ProjectRoot\android\app\build\outputs\apk\release\app-release.apk" -File
    $artifact = Join-Path $runDirectory 'ghaf-internal-rehearsal-arm64.apk'
    Copy-Item -LiteralPath $apk -Destination $artifact
    $signature = Invoke-Recorded 'apk-signature' $required.apksigner @('verify', '--verbose', '--print-certs', $artifact)
    $certPath = Join-Path $runDirectory 'template-cert.der'
    $null = Invoke-Recorded 'template-certificate' $required.keytool @('-exportcert', '-keystore', $required.keystore, '-alias', 'androiddebugkey', '-storepass', 'android', '-file', $certPath)
    $certificates = [regex]::Matches($signature, '(?m)^Signer #\d+ certificate SHA-256 digest: ([0-9a-fA-F]+)\s*$')
    if ($certificates.Count -ne 1 -or $certificates[0].Groups[1].Value.ToLowerInvariant() -ne (Hash-File $certPath)) { throw 'APK signer differs from the pinned template debug identity.' }
    $badging = Invoke-Recorded 'apk-badging' $required.aapt @('dump', 'badging', $artifact)
    $manifest = Invoke-Recorded 'apk-manifest' $required.aapt @('dump', 'xmltree', $artifact, 'AndroidManifest.xml')
    $permissions = Invoke-Recorded 'apk-permissions' $required.aapt @('dump', 'permissions', $artifact)
    if ($badging -notmatch "(?m)^package: name='ae\.ac\.ku\.ghaf\.prototype' versionCode='1' versionName='0\.1\.0'" -or
        $badging -notmatch "(?m)^targetSdkVersion:'36'" -or $badging -match 'application-debuggable' -or
        $badging -notmatch "(?m)^native-code: 'arm64-v8a'\s*$" -or
        $manifest -notmatch 'android:allowBackup\([^)]*\)=\(type 0x12\)0x0\b' -or
        $permissions -match 'android.permission.(READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE)') { throw 'APK package/version/SDK/ABI/backup/permission verification failed.' }
    $archive = [IO.Compression.ZipFile]::OpenRead($artifact)
    try {
        $bundle = @($archive.Entries | Where-Object { $_.FullName -eq 'assets/index.android.bundle' -and $_.Length -gt 0 })
        $abis = @($archive.Entries | Where-Object { $_.FullName -match '^lib/([^/]+)/[^/]+\.so$' } | ForEach-Object { $_.FullName.Split('/')[1] } | Sort-Object -Unique)
        if ($bundle.Count -ne 1 -or $abis.Count -ne 1 -or $abis[0] -ne 'arm64-v8a') { throw 'APK lacks one standalone bundle or contains an unexpected native ABI.' }
        $receipt.bundleBytes = $bundle[0].Length
    } finally { $archive.Dispose() }
    $receipt.apk = @{ path = $artifact; sha256 = (Hash-File $artifact); signerSha256 = (Hash-File $certPath); abis = $abis; permissions = @([regex]::Matches($permissions, "(?m)^uses-permission(?:-sdk-23)?: name='([^']+)'") | ForEach-Object { $_.Groups[1].Value }) }
    $receipt.nativePolicyAcceptance = 'Final module DSL coverage verified; generated Ninja edge coverage and runtime resource supervision require operator review'
    $receipt.status = 'APK VERIFIED FOR INTERNAL REHEARSAL'
    Write-Host "Internal arm64 APK verified: $artifact. Physical and human acceptance NOT RUN."
} catch {
    $receipt.failure = $_.Exception.Message
    Write-Error $_.Exception.Message -ErrorAction Continue
    exit 1
} finally {
    if ($null -ne $buildLock) { $buildLock.Dispose() }
    $receipt.finishedUtc = [DateTime]::UtcNow.ToString('o')
    if ($null -ne $runDirectory) {
        $receipt | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath (Join-Path $runDirectory 'receipt.json') -Encoding utf8NoBOM
    }
}
