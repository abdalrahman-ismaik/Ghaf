export type ParentHomeRouteParam = string | readonly string[] | undefined;

export function readLegacyParentHomeParam(value: ParentHomeRouteParam): string | undefined {
  if (typeof value === 'string') return value;
  return Array.isArray(value) ? value[0] : undefined;
}

export function readStrictParentHomeParam(value: ParentHomeRouteParam): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
