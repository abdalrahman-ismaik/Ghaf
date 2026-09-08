import { Asset } from 'expo-asset';

export type AssetModule = Parameters<typeof Asset.fromModule>[0];

const localImageLoads = new Map<AssetModule, Promise<void>>();

export function loadLocalImage(source: AssetModule): Promise<void> {
  const existing = localImageLoads.get(source);
  if (existing) return existing;

  let pending: Promise<void>;
  try {
    pending = Asset.fromModule(source)
      .downloadAsync()
      .then(() => undefined);
  } catch (error) {
    pending = Promise.reject(error);
  }
  localImageLoads.set(source, pending);
  return pending;
}
