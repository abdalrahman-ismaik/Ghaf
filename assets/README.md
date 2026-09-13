# Packaged assets

Only reviewed files referenced by static application imports belong in the runtime asset catalog.

| Directory          | Contents                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| [brand/](brand/)   | Canonical Ghaf mark and platform derivatives                             |
| [images/](images/) | Prepared fixtures, approved access portraits and botanical illustrations |
| [audio/](audio/)   | Prepared narration and ambient tracks with per-package provenance        |
| [demo/](demo/)     | Preserved synthetic Feature 002 media                                    |

Web-served icon copies live in [`public/`](../public/). Brand authoring and provenance live in
[`docs/design/brand/`](../docs/design/brand/); generators live in
[`scripts/brand/`](../scripts/brand/). Keep these roles separate.

Document origin, rights/review status and checksums beside an approved media package. Keep raw
source archives, unreviewed candidates and generated captures in ignored local output until their
owner approves intake. A locally present folder or file is not automatically a packaged asset.
Preserve user-supplied material; do not execute imported templates or vendor another application's
source into this Expo app. Historical assets remain attributed to their original feature.
