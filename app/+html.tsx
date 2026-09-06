import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// Start the static web document in Arabic. Runtime locale sync updates these attributes
// after the user changes language.
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
