# Ambient Audio v1 Contract

## Preference repository

```ts
interface AmbientAudioPreferencesRepository {
  read(): DomainResult<AmbientAudioPreferenceRecord | null>;
  save(enabled: boolean): DomainResult<AmbientAudioPreferenceRecord>;
  clear(): DomainResult<true>;
}
```

- `read()` returns `null` only when no preference has been stored.
- Every non-null result has exactly the v1 keys and values defined in `data-model.md`.
- Invalid JSON, extra/missing keys, non-Boolean choices, and unknown versions fail validation.
- `save()` validates before and after serialization and returns a detached value.
- `clear()` removes only this preference record.
- Storage errors contain no stored value and do not mutate the last authoritative store view.

## Store contract

```ts
interface AmbientAudioStoreSlice {
  readonly ambientAudioPreference: AmbientAudioPreferenceView;
  readonly setAmbientSoundEnabled: (enabled: boolean) => ServiceResult<boolean>;
}
```

- Both role settings read the same view and call the same action.
- The action requires a Boolean but no role authority or reauthentication.
- State changes only after a successful repository write.
- Sign-out and role handoff leave the preference unchanged.
- Parent-authorized exact reset clears the repository and restores `ready/default/on`.

## Playback policy

```ts
interface AmbientPlaybackInput {
  readonly enabled: boolean;
  readonly startupReady: boolean;
  readonly appState: 'active' | 'background' | 'inactive' | 'unknown';
  readonly screenReaderActive: boolean | null;
  readonly webPlaybackUnlocked: boolean;
  readonly narrationPlaying: boolean;
  readonly exclusiveAudioActive: boolean;
}

interface AmbientPlaybackDecision {
  readonly shouldPlay: boolean;
  readonly volume: 'quiet' | 'ducked';
}
```

`shouldPlay` is true only when enabled, ready, active, screen reader is exactly false, browser
playback is eligible, and no exclusive audio work is active. `volume` is ducked during narration and
quiet otherwise. The provider configures `loop = true`, uses the static local asset, and pauses on
every false decision and on unmount. It never requests recording or notification permission.

## Settings presentation

- Title: “Nature ambience” / “أصوات الطبيعة الهادئة”.
- Explanation states that quiet nature sound loops while Ghaf is open and can be silenced here.
- One native switch exposes role `switch`, the translated title, translated hint, and checked state.
- Logical row direction follows locale; copy wraps; the switch does not shrink below its native
  target; touch height is at least 48dp.
- A failed save leaves the switch unchanged and shows the existing recoverable-warning pattern.
