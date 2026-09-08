export interface ImageBatchResult {
  readonly failed: number;
  readonly settled: number;
  readonly total: number;
}

interface SettleImageSourcesInBatchesOptions<TSource> {
  readonly batchSize?: number;
  readonly loadImage: (source: TSource) => Promise<unknown>;
  readonly sources: readonly TSource[];
}

export async function settleImageSourcesInBatches<TSource>({
  batchSize = 6,
  loadImage,
  sources,
}: SettleImageSourcesInBatchesOptions<TSource>): Promise<ImageBatchResult> {
  const safeBatchSize = Math.max(1, Math.floor(batchSize));
  let failed = 0;
  let settled = 0;

  for (let index = 0; index < sources.length; index += safeBatchSize) {
    const batch = sources.slice(index, index + safeBatchSize);
    const results = await Promise.allSettled(
      batch.map((source) => Promise.resolve().then(() => loadImage(source))),
    );
    failed += results.filter((result) => result.status === 'rejected').length;
    settled += results.length;
  }

  return { failed, settled, total: sources.length };
}
