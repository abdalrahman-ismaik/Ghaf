import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { masroofiDemoEnabled } from '@/config/masroofi';
import { botanical, spacing } from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import { useMasroofiPresentation } from './shared';

export function MasroofiEntry({ role }: { role: 'parent' | 'child' }) {
  const router = useRouter();
  const { t, direction } = useMasroofiPresentation();
  const masroofi = usePrototypeStore((state) => state.masroofi);
  const getChild = usePrototypeStore((state) => state.getMasroofiChild);
  if (!masroofiDemoEnabled) return null;
  void masroofi;
  const view = role === 'child' ? getChild() : null;
  if (role === 'child' && (!view?.ok || !view.data.card)) return null;
  return (
    <View style={styles.entry} testID={`masroofi-entry-${role}`}>
      <Button
        brand
        icon={<GhafIcon color={botanical.colors.forest} name="leaf" />}
        onPress={() =>
          router.push((role === 'parent' ? '/parent/family/masroofi' : '/child/masroofi') as Href)
        }
        variant="secondary"
      >
        {t(role === 'parent' ? 'masroofi.parentEntry' : 'masroofi.childEntry')}
      </Button>
      <Text brand color="inkMuted" direction={direction} variant="caption">
        {t(role === 'parent' ? 'masroofi.parentEntryBody' : 'masroofi.childEntryBody')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ entry: { gap: spacing.xs } });
