export interface RecognitionAnnouncementParts {
  readonly award: string | null;
  readonly landscape: string | null;
  readonly canopy: string | null;
  readonly circle: string | null;
}

export function buildRecognitionAnnouncement(parts: RecognitionAnnouncementParts): string {
  const message = [parts.award, parts.landscape, parts.canopy, parts.circle]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim().replace(/[.!?؟]+$/u, ''))
    .join('. ');

  return message ? `${message}.` : '';
}
