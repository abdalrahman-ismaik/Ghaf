export interface StartupImageProgress {
  readonly failed: number;
  readonly presentationReady: boolean;
  readonly settled: number;
  readonly total: number;
}

interface SettleStartupImageSourcesOptions<TSource> {
  readonly batchSize?: number;
  readonly criticalSources: readonly TSource[];
  readonly loadImage: (source: TSource) => Promise<unknown>;
  readonly onProgress?: (progress: StartupImageProgress) => void;
  readonly remainingSources: readonly TSource[];
}

export async function settleStartupImageSources<TSource>({
  batchSize = 6,
  criticalSources,
  loadImage,
  onProgress,
  remainingSources,
}: SettleStartupImageSourcesOptions<TSource>): Promise<StartupImageProgress> {
  const total = criticalSources.length + remainingSources.length;
  let failed = 0;
  let settled = 0;
  let presentationReady = false;

  const settleBatch = async (sources: readonly TSource[], completesPresentation = false) => {
    const results = await Promise.allSettled(sources.map((source) => loadImage(source)));
    failed += results.filter((result) => result.status === 'rejected').length;
    settled += results.length;
    if (completesPresentation) presentationReady = true;
    const progress = { failed, presentationReady, settled, total };
    onProgress?.(progress);
    return progress;
  };

  await settleBatch(criticalSources, true);

  for (let index = 0; index < remainingSources.length; index += batchSize) {
    await settleBatch(remainingSources.slice(index, index + batchSize));
  }

  return { failed, presentationReady, settled, total };
}
