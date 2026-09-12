import { useState } from 'react';

import { OriginalWelcomeScreen } from '@/components/access/OriginalWelcomeScreen';
import { FirstRunOnboarding, useFirstRunExperience } from '@/components/onboarding';

import { OriginalDemoChildChooser } from './OriginalDemoChildChooser';
import type { DemoEntryScreenProps } from './types';

export function OriginalDemoEntryScreen({
  locale,
  direction,
  copy,
  busy,
  error,
  restartRequired,
  entryEpoch,
  onChooseProfile,
  onChangeLocale,
}: DemoEntryScreenProps) {
  const { state: firstRunState } = useFirstRunExperience();
  const [choosingChild, setChoosingChild] = useState(false);

  if (entryEpoch === 0 && !firstRunState.completed && !restartRequired) {
    return <FirstRunOnboarding narrationEnabled={false} />;
  }
  if (choosingChild && !restartRequired) {
    return (
      <OriginalDemoChildChooser
        locale={locale}
        direction={direction}
        copy={copy}
        busy={busy}
        error={error}
        onChooseProfile={onChooseProfile}
        onBack={() => setChoosingChild(false)}
      />
    );
  }
  return (
    <OriginalWelcomeScreen
      locale={locale}
      direction={direction}
      onChangeLocale={onChangeLocale}
      onParent={() => {
        if (!busy && !restartRequired) onChooseProfile('parent_al_noor');
      }}
      onChild={() => {
        if (!busy && !restartRequired) setChoosingChild(true);
      }}
      busy={busy || restartRequired}
      notice={restartRequired ? copy.restartRequiredBody : error}
      busyLabel={busy ? copy.busyLabel : undefined}
    />
  );
}
