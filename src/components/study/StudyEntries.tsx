import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StudyButton, StudyText, studyStyles as s } from './shared';

export function StudyEntries({ role }: { role: 'parent' | 'child' }) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={s.card} testID={`study-entries-${role}`}>
      <StudyText variant="heading">{t('study.title')}</StudyText>
      <StudyText>{t('study.entryBody')}</StudyText>
      <StudyButton
        onPress={() => router.push((role === 'parent' ? '/parent/study' : '/child/study') as Href)}
        testID={`open-study-${role}`}
      >
        {t('study.title')}
      </StudyButton>
      <StudyButton
        variant="secondary"
        onPress={() =>
          router.push((role === 'parent' ? '/parent/practices' : '/child/practices') as Href)
        }
        testID={`open-practices-${role}`}
      >
        {t('familyPractices.navTitle')}
      </StudyButton>
    </View>
  );
}
