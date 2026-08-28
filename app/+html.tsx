import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * Defines the static web document shell. Arabic is the deterministic starting
 * locale; the runtime locale synchronizer updates these attributes after a
 * language change.
 */
export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html dir="rtl" lang="ar">
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
