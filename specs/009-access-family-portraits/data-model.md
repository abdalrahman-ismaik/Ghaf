# Data Model: Access Family Portraits

Feature 009 adds no persisted runtime entity. It defines two static asset descriptors and one
presentation-state rule.

## Access portrait asset descriptor

| Field         | Parent composition                            | Child composition                            |
| ------------- | --------------------------------------------- | -------------------------------------------- |
| Local path    | Versioned v2 JPEG                             | Versioned v1 JPEG                            |
| Pixel size    | 1200×800                                      | 1200×800                                     |
| Subjects      | One fictional father and one fictional mother | One fictional boy and one fictional girl     |
| Attire        | Kandura/ghutra/agal; abaya/hijab              | Age-appropriate Emirati traditional clothing |
| Accessibility | Decorative/hidden                             | Decorative/hidden                            |
| Authority     | None                                          | None                                         |
| Load policy   | Destination-section preload; failure settled  | Destination-section preload; failure settled |

## Presentation state

- `ready`: render the local image inside a responsive 3:2 frame.
- `failed`: return `null`, removing the frame and leaving the route content/actions unchanged.

No loading state, placeholder, retry, persisted flag, analytics event, role/profile selection, or
store mutation is added.
