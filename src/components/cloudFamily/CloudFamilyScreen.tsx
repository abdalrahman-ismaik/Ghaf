import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/primitives';
import { logicalRowDirection, spacing } from '@/design/tokens';
import type { CloudCommand, CloudCommandResult, CloudSnapshot } from '@/models/cloudFamily';
import { FamilyPanel } from './FamilyPanel';
import { TasksPanel } from './TasksPanel';
import { ChildTaskPanel } from './ChildTaskPanel';
import { GrowthPanel } from './GrowthPanel';
import { LearningPanel } from './LearningPanel';
import { LeaguePanel } from './LeaguePanel';
import { RewardsPanel } from './RewardsPanel';
import { MasroofiPanel } from './MasroofiPanel';
import { StudyPanel } from './StudyPanel';
import { GoalsPanel } from './GoalsPanel';
import { CompanionPanel } from './CompanionPanel';

export interface CloudPanelProps {
  snapshot: CloudSnapshot;
  busy: boolean;
  command: (command: CloudCommand) => Promise<CloudCommandResult | null>;
}

export function CloudFamilyScreen(props: CloudPanelProps) {
  const { t, i18n } = useTranslation();
  const direction = i18n.resolvedLanguage === 'en' ? 'ltr' : 'rtl';
  const parent = props.snapshot.actor.role === 'parent';
  const [selected, setSelected] = useState(parent ? 'family' : 'tasks');
  const panels = [
    ...(parent ? [{ id: 'family', element: <FamilyPanel {...props} /> }] : []),
    { id: 'tasks', element: parent ? <TasksPanel {...props} /> : <ChildTaskPanel {...props} /> },
    { id: 'garden', element: <GrowthPanel {...props} /> },
    { id: 'learning', element: <LearningPanel {...props} /> },
    { id: 'rewards', element: <RewardsPanel {...props} /> },
    { id: 'masroofi', element: <MasroofiPanel {...props} /> },
    { id: 'study', element: <StudyPanel {...props} /> },
    { id: 'goals', element: <GoalsPanel {...props} /> },
    { id: 'league', element: <LeaguePanel {...props} /> },
    { id: 'companion', element: <CompanionPanel {...props} active={selected === 'companion'} /> },
  ];
  return (
    <View style={styles.root} testID="cloud-family-screen">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.tabs,
          { flexDirection: Platform.OS === 'web' ? 'row' : logicalRowDirection(direction) },
        ]}
        style={[styles.tabScroller, Platform.OS === 'web' ? { direction } : null]}
      >
        {panels.map((panel) => (
          <Button
            key={panel.id}
            brand
            fullWidth={false}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: selected === panel.id }}
            testID={`cloud-tab-${panel.id}`}
            variant={selected === panel.id ? 'primary' : 'secondary'}
            onPress={() => setSelected(panel.id)}
          >
            {t(`cloudFamily.tabs.${panel.id}`)}
          </Button>
        ))}
      </ScrollView>
      {panels.map((panel) => (
        <View
          key={panel.id}
          style={selected === panel.id ? styles.root : styles.hidden}
          accessibilityElementsHidden={selected !== panel.id}
          importantForAccessibility={selected === panel.id ? 'auto' : 'no-hide-descendants'}
          testID={`cloud-panel-${panel.id}`}
        >
          {panel.element}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md, width: '100%' },
  tabs: { gap: spacing.xs },
  tabScroller: { width: '100%', flexGrow: 0 },
  tab: { minWidth: 88 },
  hidden: { display: 'none' },
});
