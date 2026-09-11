import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

describe('bounded live Child voice UI contract', () => {
  it('keeps real capture behind the independent voice flag and the 12–14 band', () => {
    const task = source('app/child/task.tsx');

    expect(task).toContain('aiFeatureFlags.ai_child_coach_voice_live');
    expect(task).toContain("activeChildAgeBand === '12_14'");
    expect(task).toContain('<LiveVoiceCapturePanel');
    expect(task).toContain('<SyntheticVoicePanel');
  });

  it('uses visible hold-only capture with foreground and route cleanup', () => {
    const panel = source('src/components/family-growth/LiveVoiceCapturePanel.tsx');
    const appConfig = source('app.config.ts');

    for (const marker of [
      'onPressIn',
      'onPressOut',
      'live-voice-held-indicator',
      "AppState.addEventListener('change'",
      'onCancel',
      'liveVoiceNoBackground',
      'liveVoiceMaximum',
    ]) {
      expect(panel).toContain(marker);
    }
    expect(panel).not.toMatch(/speaker|biometric|emotion|truthful/iu);
    expect(appConfig).toContain('recordAudioAndroid: true');
    expect(appConfig).toContain('enableBackgroundRecording: false');
    expect(appConfig).toContain('enableBackgroundPlayback: false');
  });

  it('requires visible transcript approval, supports editing and deletion, and sends text only', () => {
    const panel = source('src/components/family-growth/LiveVoiceCapturePanel.tsx');

    for (const marker of [
      'live-voice-transcript',
      'onEditTranscript',
      'onMarkReady',
      'onDelete',
      'onSend',
      'liveVoiceAudioDeleted',
      'liveVoicePreparedTranscript',
    ]) {
      expect(panel).toContain(marker);
    }
    expect(panel).not.toContain('audioBytes');
  });

  it('keeps the voice notice, lifecycle, fallback, and errors bilingual', () => {
    const resources = source('src/i18n/resources.ts');

    for (const key of [
      'liveVoiceTitle',
      'liveVoiceNotice',
      'liveVoiceNoBackground',
      'liveVoiceMaximum',
      'liveVoicePermission',
      'liveVoiceHold',
      'liveVoiceRecording',
      'liveVoiceTranscript',
      'liveVoiceApproveText',
      'liveVoiceDelete',
      'liveVoiceSendText',
      'liveVoiceAudioDeleted',
      'liveVoicePreparedTranscript',
      'liveVoiceDenied',
      'liveVoiceFailure',
    ]) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});
