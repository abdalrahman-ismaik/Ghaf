import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceAssetPath = join(sourceRoot, 'assets/images/fixture-recycling-clean-v1.png');
const runtimeAssetPath = join(sourceRoot, 'assets/images/fixture-recycling-clean-v1.webp');

function readLossyWebpDimensions(buffer: Buffer): {
  width: number;
  height: number;
} {
  expect(buffer.toString('ascii', 0, 4)).toBe('RIFF');
  expect(buffer.toString('ascii', 8, 12)).toBe('WEBP');
  expect(buffer.toString('ascii', 12, 16)).toBe('VP8 ');
  expect([...buffer.subarray(23, 26)]).toEqual([0x9d, 0x01, 0x2a]);

  return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff,
  };
}

function readWebpChunkIds(buffer: Buffer): string[] {
  const chunkIds: string[] = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    chunkIds.push(buffer.toString('ascii', offset, offset + 4));
    const chunkSize = buffer.readUInt32LE(offset + 4);
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return chunkIds;
}

describe('Android prepared image payload', () => {
  it('bundles the optimized WebP instead of the archival PNG', () => {
    const registry = readFileSync(join(sourceRoot, 'src/components/demoAssets.ts'), 'utf8');

    expect(registry).toContain("require('../../assets/images/fixture-recycling-clean-v1.webp')");
    expect(registry).not.toContain("require('../../assets/images/fixture-recycling-clean-v1.png')");
  });

  it('keeps the reviewed dimensions within a small Android payload', () => {
    const runtimeAsset = readFileSync(runtimeAssetPath);
    const runtimeBytes = statSync(runtimeAssetPath).size;
    const sourceBytes = statSync(sourceAssetPath).size;

    expect(readLossyWebpDimensions(runtimeAsset)).toEqual({
      width: 1448,
      height: 1086,
    });
    expect(runtimeBytes).toBeLessThanOrEqual(160 * 1024);
    expect(runtimeBytes / sourceBytes).toBeLessThan(0.1);
  });

  it('does not carry private image metadata into the runtime asset', () => {
    const chunkIds = readWebpChunkIds(readFileSync(runtimeAssetPath));

    for (const chunk of ['EXIF', 'ICCP', 'XMP ']) {
      expect(chunkIds).not.toContain(chunk);
    }
  });
});
