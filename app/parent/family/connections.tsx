import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FamilyConnectionPlan } from '@/components/family/FamilyConnectionPlan';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003Status } from '@/components/r003';
import { selectHasActiveParentExperience, usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentFamilyConnectionsRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const allowed = usePrototypeStore(selectHasActiveParentExperience);
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const family = usePrototypeStore((state) => state.localFamily.record);
  const generation = usePrototypeStore((state) => state.demoRunGeneration);
  const getPlan = usePrototypeStore((state) => state.getFamilyConnectionPlan);
  if (!allowed) return <Redirect href="/" />;
  const result = getPlan();
  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace('/parent/settings')}
          title={t('familyConnectionEdit.title')}
        />
      }
      testID="parent-family-connections-screen"
    >
      {result.ok ? (
        <FamilyConnectionPlan
          key={`${generation}:${family?.createdAt}:${family?.parent.normalizedIdentifier}`}
          direction={direction}
          language={locale}
          plan={result.data}
          editable
        />
      ) : (
        <R003Status
          direction={direction}
          language={locale}
          message={t('familyConnectionEdit.error')}
          tone="warning"
        />
      )}
    </R002aScreen>
  );
}
