import { useState } from 'react';
import { View } from 'react-native';

import { CompanionPortrait } from '@/components/companion/CompanionPortrait';
import { Text } from '@/components/primitives';
import type { CloudFamilyTask } from '@/models/cloudFamily';

import { CloudAction, cloudStyles, useCloudCopy } from './common';

export function CloudPreparedTaskGuide({ task }: { readonly task: CloudFamilyTask }) {
  const { text, locale } = useCloudCopy();
  const [open, setOpen] = useState(false);
  const steps = task.template.catalogExecution?.steps ?? [];
  const nextStep = steps.find((step) => !task.stepStates[step.id]);
  return (
    <View style={cloudStyles.row}>
      <CloudAction
        variant="secondary"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        testID="cloud-prepared-guide-toggle"
      >
        {text('preparedGuide')}
      </CloudAction>
      {open ? (
        <View style={cloudStyles.card} testID="cloud-prepared-guide">
          <CompanionPortrait />
          <Text brand variant="caption">
            {text('preparedGuideNotice')}
          </Text>
          <Text brand>{nextStep?.text[locale] ?? task.template.definitionOfDone[locale]}</Text>
          {nextStep?.condition ? <Text brand>{nextStep.condition[locale]}</Text> : null}
          <Text brand>{task.template.permittedHelp[locale]}</Text>
          <Text brand>{task.template.safety.stopAndAskAdult[locale]}</Text>
        </View>
      ) : null}
    </View>
  );
}
