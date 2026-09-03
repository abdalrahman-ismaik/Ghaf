# Ghaf Runtime Fonts

Ghaf bundles Alexandria and Readex Pro from the local npm packages below. The application never
loads the Google Fonts URLs embedded in the Stitch HTML exports.

| Family | Package | Runtime weights | License |
| ------ | ------- | --------------- | ------- |
| Alexandria | `@expo-google-fonts/alexandria@0.4.2` | 400, 700, 800 | SIL Open Font License 1.1 |
| Readex Pro | `@expo-google-fonts/readex-pro@0.4.1` | 400, 500, 600, 700 | SIL Open Font License 1.1 |

The exact font binaries and license texts remain in the declared packages under `node_modules` and
are bundled by Expo through the `expo-font` config plugin plus the root runtime loader. Package
integrity is pinned by `package-lock.json`.
