import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FamilyPeopleEditor } from '@/components/access/FamilyPeopleEditor';
import { StudyButton, StudyInput, StudyText, studyStyles as s } from '@/components/study/shared';
import { TASK_CATEGORIES } from '@/features/tasks/demoContent';
import { createFamilyConnectionPlan } from '@/features/family-connections';
import { createPreparedProfilePersonalization } from '@/features/assistants/profilePersonalization';
import { cloudPreferencesSchema } from '@/features/cloud-study/validation';
import { localize } from '@/i18n';
import type {
  CloudDocumentCommand,
  CloudFamilyDocument,
  CloudProfilePreferences,
  CloudSavedTemplate,
} from '@/models/cloudFamilyDocuments';
import type { FamilyConnectionDirectory } from '@/models/familyConnections';

interface Props {
  documents: readonly CloudFamilyDocument[];
  childId: string | null;
  childAgeBand?: '6_8' | '9_11' | '12_14';
  busy: boolean;
  onCommand: (command: CloudDocumentCommand) => Promise<boolean>;
  getDocuments: () => readonly CloudFamilyDocument[] | null;
  onUseTemplate?: (template: CloudSavedTemplate) => void;
}
export function CloudFamilyDetails(props: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const [tab, setTab] = useState<'connections' | 'preferences' | 'templates'>('connections');
  return (
    <View style={s.stack}>
      <View style={s.row}>
        {(['connections', 'preferences', 'templates'] as const).map((value) => (
          <StudyButton
            key={value}
            fullWidth={false}
            variant={value === tab ? 'primary' : 'secondary'}
            onPress={() => setTab(value)}
          >
            {t(`cloudDocuments.${value}`)}
          </StudyButton>
        ))}
      </View>
      {tab === 'connections' ? <ConnectionEditor {...props} locale={locale} /> : null}
      {tab === 'preferences' ? (
        props.childId ? (
          <PreferenceEditor key={props.childId} {...props} />
        ) : (
          <StudyText>{t('cloudDocuments.emptyChildren')}</StudyText>
        )
      ) : null}
      {tab === 'templates' ? <TemplateEditor {...props} locale={locale} /> : null}
    </View>
  );
}
function ConnectionEditor({ documents, busy, onCommand, locale }: Props & { locale: 'ar' | 'en' }) {
  const { t } = useTranslation();
  const record = documents.find((row) => row.kind === 'connections');
  const [draft, setDraft] = useState<FamilyConnectionDirectory | null>(null);
  const [draftRevision, setDraftRevision] = useState(0);
  const [editingRelative, setEditingRelative] = useState(false);
  const saved = record?.kind === 'connections' ? record.payload : null;
  const plan = saved ? createFamilyConnectionPlan(saved) : null;
  return (
    <View style={s.stack}>
      {draft ? (
        <>
          <FamilyPeopleEditor
            directory={draft}
            disabled={busy}
            direction={locale === 'ar' ? 'rtl' : 'ltr'}
            language={locale}
            onChange={setDraft}
            onEditingChange={setEditingRelative}
          />
          <StudyButton
            disabled={busy || editingRelative}
            testID="cloud-connections-save"
            onPress={() => {
              void onCommand({
                type: 'connections.save',
                expectedRevision: draftRevision,
                input: draft,
              }).then((success) => {
                if (success) setDraft(null);
              });
            }}
          >
            {t('familyConnectionEdit.save')}
          </StudyButton>
          <StudyButton variant="quiet" disabled={busy} onPress={() => setDraft(null)}>
            {t('familyConnectionEdit.cancel')}
          </StudyButton>
        </>
      ) : (
        <>
          {saved ? (
            <StudyText>
              {[saved.primaryGuardianName, saved.secondaryGuardianName].filter(Boolean).join(' · ')}
            </StudyText>
          ) : (
            <StudyText>{t('familyConnectionEdit.empty')}</StudyText>
          )}
          {plan?.ok
            ? plan.data.entries.map((entry) => (
                <View key={entry.relativeId} style={s.notice}>
                  <StudyText>{entry.displayName}</StudyText>
                  <StudyText>
                    {t(
                      `r003.family.connectionIdeas.${({ visit_or_call: 'visitOrCall', family_story: 'familyStory', safe_help: 'safeHelp', thank_you_message: 'thankYouMessage', phone_free_moment: 'phoneFreeMoment' } as const)[entry.ideaKind]}`,
                      { name: '\u2068' + entry.displayName + '\u2069' },
                    )}
                  </StudyText>
                </View>
              ))
            : null}
          <StudyButton
            testID="cloud-connections-edit"
            onPress={() => {
              setDraftRevision(record?.revision ?? 0);
              setDraft(
                saved
                  ? structuredClone(saved)
                  : { primaryGuardianName: '', secondaryGuardianName: '', relatives: [] },
              );
            }}
          >
            {t('familyConnectionEdit.edit')}
          </StudyButton>
        </>
      )}
    </View>
  );
}
const preferenceOptions = {
  interests: ['nature', 'making', 'stories', 'family_helping', 'sustainability'],
  hobbies: ['drawing', 'reading', 'sports', 'puzzles', 'gardening'],
  accessibilityDefaults: ['larger_text', 'simpler_instructions', 'high_contrast', 'reduced_motion'],
  supportPreferences: [
    'short_steps',
    'visual_examples',
    'extra_time',
    'adult_alongside',
    'quiet_reminders',
  ],
} as const;
type PreferenceDraft = Omit<CloudProfilePreferences, 'sex'> & { sex: 'male' | 'female' | null };
function PreferenceEditor({
  documents,
  childId,
  childAgeBand,
  onCommand,
  getDocuments,
  busy,
}: Props) {
  const { t } = useTranslation();
  const record = documents.find(
    (row) => row.kind === 'profile_preferences' && row.childId === childId,
  );
  const savedSignals = record?.kind === 'profile_preferences' ? record.payload : null;
  const prepared =
    savedSignals && childAgeBand
      ? createPreparedProfilePersonalization({
          ageBand: childAgeBand,
          sex: savedSignals.sex,
          interests: savedSignals.interests,
          hobbies: savedSignals.hobbies,
          accessibilityDefaults: savedSignals.accessibilityDefaults,
          supportPreferences: savedSignals.supportPreferences,
          customInterest: savedSignals.customInterest,
          customHobby: savedSignals.customHobby,
          customSupportPreference: savedSignals.customSupportPreference,
          customAccessibility: savedSignals.customAccessibility,
          personalizationEnabled: savedSignals.personalizationEnabled,
        })
      : null;
  const [draft, setDraft] = useState<PreferenceDraft>(() =>
    record?.kind === 'profile_preferences'
      ? structuredClone(record.payload)
      : {
          avatarId: 'ghaf_tree',
          preferredLanguage: 'ar',
          sex: null,
          interests: [],
          hobbies: [],
          accessibilityDefaults: [],
          supportPreferences: [],
          customInterest: null,
          customHobby: null,
          customSupportPreference: null,
          customAccessibility: null,
          personalizationEnabled: false,
        },
  );
  const [draftRevision, setDraftRevision] = useState(record?.revision ?? 0);
  const [invalid, setInvalid] = useState(false);
  return (
    <View style={s.stack}>
      <StudyText>{t('cloudDocuments.preferencesEmpty')}</StudyText>
      {prepared?.ok && prepared.data.recommendations.length > 0 ? (
        <View style={s.notice}>
          <StudyText>{t('cloudDocuments.preparedSuggestions')}</StudyText>
          {prepared.data.recommendations.map((recommendation) => (
            <StudyText key={recommendation.categoryId}>
              {t(`profileRecommendations.${recommendation.reasonCode}`)}
            </StudyText>
          ))}
        </View>
      ) : null}
      <StudyText>{t('cloudDocuments.chooseSex')}</StudyText>
      <View style={s.row}>
        {(['male', 'female'] as const).map((value) => (
          <StudyButton
            key={value}
            fullWidth={false}
            variant={draft.sex === value ? 'primary' : 'secondary'}
            onPress={() => setDraft({ ...draft, sex: value })}
          >
            {t(`cloudDocuments.${value}`)}
          </StudyButton>
        ))}
      </View>
      <StudyText>{t('cloudDocuments.language')}</StudyText>
      <View style={s.row}>
        {(['ar', 'en', 'both'] as const).map((value) => (
          <StudyButton
            key={value}
            fullWidth={false}
            variant={draft.preferredLanguage === value ? 'primary' : 'secondary'}
            onPress={() => setDraft({ ...draft, preferredLanguage: value })}
          >
            {t(`cloudDocuments.${value}`)}
          </StudyButton>
        ))}
      </View>
      <StudyText>{t('cloudDocuments.avatar')}</StudyText>
      <View style={s.row}>
        {(['ghaf_tree', 'leaf', 'flower', 'energy_leaf', 'water_drop'] as const).map((value) => (
          <StudyButton
            key={value}
            fullWidth={false}
            variant={draft.avatarId === value ? 'primary' : 'secondary'}
            onPress={() => setDraft({ ...draft, avatarId: value })}
          >
            {t(`cloudDocuments.options.${value}`)}
          </StudyButton>
        ))}
      </View>
      {(Object.keys(preferenceOptions) as (keyof typeof preferenceOptions)[]).map((key) => (
        <View key={key} style={s.stack}>
          <StudyText>{t(`cloudDocuments.${key}`)}</StudyText>
          <View style={s.row}>
            {preferenceOptions[key].map((value) => {
              const selected = (draft[key] as readonly string[]).includes(value);
              return (
                <StudyButton
                  key={value}
                  fullWidth={false}
                  variant={selected ? 'primary' : 'secondary'}
                  accessibilityState={{ selected }}
                  onPress={() =>
                    setDraft({
                      ...draft,
                      [key]: selected
                        ? draft[key].filter((item) => item !== value)
                        : [...draft[key], value],
                    })
                  }
                >
                  {t(`cloudDocuments.options.${value}`)}
                </StudyButton>
              );
            })}
          </View>
        </View>
      ))}
      {(
        ['customInterest', 'customHobby', 'customSupportPreference', 'customAccessibility'] as const
      ).map((key) => (
        <StudyInput
          key={key}
          label={t(`cloudDocuments.${key}`)}
          maxLength={160}
          value={draft[key] ?? ''}
          onChangeText={(value) => setDraft({ ...draft, [key]: value.trim() ? value : null })}
        />
      ))}
      <StudyButton
        variant={draft.personalizationEnabled ? 'primary' : 'secondary'}
        accessibilityState={{ checked: draft.personalizationEnabled }}
        onPress={() =>
          setDraft({ ...draft, personalizationEnabled: !draft.personalizationEnabled })
        }
      >
        {t('cloudDocuments.personalizationEnabled')}
      </StudyButton>
      {invalid ? (
        <StudyText accessibilityRole="alert">{t('cloudDocuments.chooseSex')}</StudyText>
      ) : null}
      <StudyButton
        disabled={busy}
        testID="cloud-preferences-save"
        onPress={() => {
          const parsed = cloudPreferencesSchema.safeParse(draft);
          setInvalid(!parsed.success);
          if (parsed.success && childId)
            void onCommand({
              type: 'preferences.save',
              childId,
              expectedRevision: draftRevision,
              input: parsed.data,
            }).then((saved) => {
              const committed = saved
                ? getDocuments()?.find(
                    (row) => row.kind === 'profile_preferences' && row.childId === childId,
                  )
                : null;
              if (committed) setDraftRevision(committed.revision);
            });
        }}
      >
        {t('study.save')}
      </StudyButton>
      {record?.kind === 'profile_preferences' ? (
        <StudyButton
          variant="quiet"
          onPress={() => {
            setDraft(structuredClone(record.payload));
            setDraftRevision(record.revision);
            setInvalid(false);
          }}
        >
          {t('familyConnectionEdit.cancel')}
        </StudyButton>
      ) : null}
    </View>
  );
}
function TemplateEditor({
  documents,
  onCommand,
  onUseTemplate,
  locale,
  busy,
}: Props & { locale: 'ar' | 'en' }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<{
    id: string | null;
    revision: number;
    input: CloudSavedTemplate;
  } | null>(null);
  const templates = documents.filter((row) => row.kind === 'saved_template');
  return (
    <View style={s.stack}>
      {editing ? (
        <>
          <StudyText>{t('cloudDocuments.category')}</StudyText>
          <View style={s.row}>
            {TASK_CATEGORIES.map((category) => (
              <StudyButton
                key={category.id}
                fullWidth={false}
                variant={editing.input.categoryId === category.id ? 'primary' : 'secondary'}
                onPress={() =>
                  setEditing({ ...editing, input: { ...editing.input, categoryId: category.id } })
                }
              >
                {localize(category.label, locale)}
              </StudyButton>
            ))}
          </View>
          {(['title', 'positiveAction'] as const).flatMap((field) =>
            (['ar', 'en'] as const).map((language) => (
              <StudyInput
                key={`${field}-${language}`}
                label={t(
                  `cloudDocuments.${field === 'title' ? 'title' : 'action'}${language === 'ar' ? 'Ar' : 'En'}`,
                )}
                direction={language === 'ar' ? 'rtl' : 'ltr'}
                value={editing.input[field][language]}
                maxLength={180}
                onChangeText={(text) =>
                  setEditing({
                    ...editing,
                    input: {
                      ...editing.input,
                      [field]: { ...editing.input[field], [language]: text },
                    },
                  })
                }
              />
            )),
          )}
          <View style={s.row}>
            {(['once', 'recurrent'] as const).map((value) => (
              <StudyButton
                key={value}
                fullWidth={false}
                variant={editing.input.recurrence === value ? 'primary' : 'secondary'}
                onPress={() =>
                  setEditing({ ...editing, input: { ...editing.input, recurrence: value } })
                }
              >
                {t(`cloudDocuments.${value}`)}
              </StudyButton>
            ))}
          </View>
          <StudyButton
            disabled={busy}
            onPress={() => {
              void onCommand({
                type: 'template.save',
                id: editing.id,
                expectedRevision: editing.revision,
                input: editing.input,
              }).then((saved) => {
                if (saved) setEditing(null);
              });
            }}
          >
            {t('study.save')}
          </StudyButton>
          <StudyButton variant="quiet" disabled={busy} onPress={() => setEditing(null)}>
            {t('familyConnectionEdit.cancel')}
          </StudyButton>
        </>
      ) : (
        <>
          <StudyButton
            testID="cloud-template-new"
            onPress={() =>
              setEditing({
                id: null,
                revision: 0,
                input: {
                  categoryId: 'home_responsibility',
                  title: { ar: '', en: '' },
                  positiveAction: { ar: '', en: '' },
                  recurrence: 'once',
                },
              })
            }
          >
            {t('cloudDocuments.newTemplate')}
          </StudyButton>
          {templates.length === 0 ? <StudyText>{t('cloudDocuments.noTemplates')}</StudyText> : null}
          {templates.map((row) => (
            <View key={row.id} style={s.card}>
              <StudyText>{localize(row.payload.title, locale)}</StudyText>
              <StudyText>{localize(row.payload.positiveAction, locale)}</StudyText>
              <StudyButton
                variant="secondary"
                onPress={() =>
                  setEditing({
                    id: row.id,
                    revision: row.revision,
                    input: structuredClone(row.payload),
                  })
                }
              >
                {t('cloudDocuments.edit')}
              </StudyButton>
              {onUseTemplate ? (
                <StudyButton onPress={() => onUseTemplate(row.payload)}>
                  {t('cloudDocuments.useTemplate')}
                </StudyButton>
              ) : null}
              <StudyButton
                variant="quiet"
                onPress={() => {
                  void onCommand({
                    type: 'template.delete',
                    id: row.id,
                    expectedRevision: row.revision,
                  });
                }}
              >
                {t('cloudDocuments.remove')}
              </StudyButton>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
