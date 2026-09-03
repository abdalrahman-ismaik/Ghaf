import { Redirect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SuccessSheet } from '@/components/access';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function FamilyCreatedSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const parentAccess = usePrototypeStore((state) => state.parentAccess);
  const draft = usePrototypeStore((state) => state.parentOnboardingDraft);

  if (parentAccess.state !== 'authenticated_parent') {
    return <Redirect href="/access/parent/sign-in" />;
  }

  const goHome = () => {
    router.dismissAll();
    requestAnimationFrame(() => router.replace('/parent'));
  };

  return (
    <View style={{ flex: 1 }} testID="family-created-success-screen">
      <SuccessSheet
        actionLabel={t('access.success.action')}
        message={t('access.success.body', { child: draft.child.nickname })}
        onAction={goHome}
        onDismiss={() => router.back()}
        testID="family-created-success-sheet"
        title={t('access.success.title')}
        visible
      />
    </View>
  );
}
