import { ParentAccountError } from '../../models/parentAccount';

export function validateParentAccountConfiguration(config: {
  url: string;
  publishableKey: string;
}): void {
  try {
    const url = new URL(config.url);
    const loopback =
      url.protocol === 'http:' &&
      ['127.0.0.1', 'localhost'].includes(url.hostname) &&
      url.port !== '';
    if (
      !config.publishableKey.startsWith('sb_publishable_') ||
      (url.protocol !== 'https:' && !loopback) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new ParentAccountError('configuration_unavailable');
  } catch {
    throw new ParentAccountError('configuration_unavailable');
  }
}
