import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Row, Text } from '@/components/primitives';
import { colors, r001Radii, spacing, type LayoutDirection } from '@/design/tokens';
import { nextFamilyRelativeId } from '@/features/family-connections';
import type { LocaleCode } from '@/models/familyGrowth';
import type {
  FamilyConnectionDirectory,
  FamilyConnectionRhythm,
  FamilyRelationship,
  FamilyRelativeId,
  NamedFamilyRelative,
} from '@/models/familyConnections';

import { AccessTextField, InfoRow, SegmentedControl } from './AccessControls';
import { GhafIcon } from './GhafIcon';

const RELATIONSHIPS: readonly FamilyRelationship[] = [
  'grandmother',
  'grandfather',
  'aunt',
  'uncle',
];
const RHYTHMS: readonly FamilyConnectionRhythm[] = [
  'weekly',
  'monthly',
  'every_three_months',
  'no_schedule',
];
const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u001f\u007f-\u009f\u200e-\u200f\u202a-\u202e\u2066-\u2069]/u;

interface RelativeEditorDraft {
  readonly id: FamilyRelativeId | null;
  readonly displayName: string;
  readonly relationship: FamilyRelationship;
  readonly rhythm: FamilyConnectionRhythm;
}

export interface FamilyPeopleEditorProps {
  readonly direction: LayoutDirection;
  readonly directory: FamilyConnectionDirectory;
  readonly disabled?: boolean;
  readonly language: LocaleCode;
  readonly onChange: (directory: FamilyConnectionDirectory) => void;
  readonly onEditingChange?: (editing: boolean) => void;
}

function emptyRelativeDraft(): RelativeEditorDraft {
  return {
    id: null,
    displayName: '',
    relationship: 'grandmother',
    rhythm: 'monthly',
  };
}

function nameIsComplete(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 40 && !CONTROL_CHARACTER_PATTERN.test(value);
}

function rhythmKey(value: FamilyConnectionRhythm): string {
  if (value === 'every_three_months') return 'everyThreeMonths';
  if (value === 'no_schedule') return 'noSchedule';
  return value;
}

export function FamilyPeopleEditor({
  direction,
  directory,
  disabled = false,
  language,
  onChange,
  onEditingChange,
}: FamilyPeopleEditorProps) {
  const { t } = useTranslation();
  const [editor, setEditor] = useState<RelativeEditorDraft | null>(null);
  const [relativeNameTouched, setRelativeNameTouched] = useState(false);
  const [primaryNameTouched, setPrimaryNameTouched] = useState(false);
  const [secondaryNameTouched, setSecondaryNameTouched] = useState(false);

  useEffect(() => {
    onEditingChange?.(editor !== null);
  }, [editor, onEditingChange]);

  const relationshipOptions = RELATIONSHIPS.map((value) => ({
    value,
    label: t('access.setup.relationship.' + value),
  }));
  const rhythmOptions = RHYTHMS.map((value) => ({
    value,
    label: t('access.setup.rhythm.' + rhythmKey(value)),
  }));

  const updateGuardian = (
    field: 'primaryGuardianName' | 'secondaryGuardianName',
    value: string,
  ) => {
    onChange({ ...directory, [field]: value });
  };

  const beginAdd = () => {
    if (disabled || directory.relatives.length >= 6) return;
    setRelativeNameTouched(false);
    setEditor(emptyRelativeDraft());
  };

  const beginEdit = (relative: NamedFamilyRelative) => {
    if (disabled) return;
    setRelativeNameTouched(false);
    setEditor({ ...relative });
  };

  const saveRelative = () => {
    if (!editor || !nameIsComplete(editor.displayName)) {
      setRelativeNameTouched(true);
      return;
    }
    const id = editor.id ?? nextFamilyRelativeId(directory.relatives);
    if (!id) return;
    const saved: NamedFamilyRelative = {
      id,
      displayName: editor.displayName.trim(),
      relationship: editor.relationship,
      rhythm: editor.rhythm,
    };
    const existingIndex = directory.relatives.findIndex((relative) => relative.id === id);
    const relatives =
      existingIndex === -1
        ? [...directory.relatives, saved]
        : directory.relatives.map((relative) => (relative.id === id ? saved : relative));
    onChange({ ...directory, relatives });
    setEditor(null);
    setRelativeNameTouched(false);
  };

  const removeRelative = (id: FamilyRelativeId) => {
    if (disabled) return;
    onChange({
      ...directory,
      relatives: directory.relatives.filter((relative) => relative.id !== id),
    });
    if (editor?.id === id) setEditor(null);
  };

  const secondaryInvalid =
    directory.secondaryGuardianName.trim().length > 0 &&
    !nameIsComplete(directory.secondaryGuardianName);

  return (
    <View style={styles.root} testID="family-people-editor">
      <View style={styles.guardianFields}>
        <AccessTextField
          accessibilityLabel={t('access.setup.primaryGuardianLabel')}
          autoCapitalize="words"
          autoCorrect={false}
          direction="auto"
          editable={!disabled}
          errorText={
            primaryNameTouched && !nameIsComplete(directory.primaryGuardianName)
              ? t('access.setup.guardianNameError')
              : undefined
          }
          label={t('access.setup.primaryGuardianLabel')}
          language={language}
          maxLength={40}
          onBlur={() => setPrimaryNameTouched(true)}
          onChangeText={(value) => updateGuardian('primaryGuardianName', value)}
          placeholder={t('access.setup.primaryGuardianPlaceholder')}
          returnKeyType="next"
          testID="primary-guardian-name-input"
          value={directory.primaryGuardianName}
        />
        <AccessTextField
          accessibilityLabel={t('access.setup.secondaryGuardianLabel')}
          autoCapitalize="words"
          autoCorrect={false}
          direction="auto"
          editable={!disabled}
          errorText={
            secondaryNameTouched && secondaryInvalid
              ? t('access.setup.guardianNameError')
              : undefined
          }
          label={t('access.setup.secondaryGuardianLabel')}
          language={language}
          maxLength={40}
          onBlur={() => setSecondaryNameTouched(true)}
          onChangeText={(value) => updateGuardian('secondaryGuardianName', value)}
          placeholder={t('access.setup.secondaryGuardianPlaceholder')}
          returnKeyType="next"
          testID="secondary-guardian-name-input"
          value={directory.secondaryGuardianName}
        />
      </View>

      <View style={styles.relativesSection}>
        <View style={styles.heading}>
          <Text
            brand
            color="deepForest"
            direction={direction}
            language={language}
            variant="screenTitle"
          >
            {t('access.setup.relativesTitle')}
          </Text>
        </View>

        {!editor && directory.relatives.length < 6 ? (
          <Button
            brand
            direction={direction}
            disabled={disabled}
            icon={
              <GhafIcon color={colors.ghafEmerald} direction={direction} name="plus" size={20} />
            }
            language={language}
            onPress={beginAdd}
            testID="add-relative"
            variant="secondary"
          >
            {t('access.setup.addRelative')}
          </Button>
        ) : null}

        <Text
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={language}
          variant="body"
        >
          {t('access.setup.relativesBody')}
        </Text>

        {directory.relatives.map((relative, index) => (
          <View key={relative.id} style={styles.relativeRow} testID={'saved-' + relative.id}>
            <Row align="flex-start" direction={direction} gap={spacing.sm}>
              <View style={styles.relativeIcon}>
                <GhafIcon
                  color={colors.ghafEmerald}
                  direction={direction}
                  name="family"
                  size={22}
                />
              </View>
              <View style={styles.relativeCopy}>
                <Text
                  accessibilityLabel={t('access.setup.relativeAccessibility', {
                    position: index + 1,
                    total: directory.relatives.length,
                    name: relative.displayName,
                    relationship: t('access.setup.relationship.' + relative.relationship),
                    rhythm: rhythmOptions.find((option) => option.value === relative.rhythm)?.label,
                  })}
                  accessible
                  brand
                  direction="auto"
                  language={language}
                  variant="control"
                >
                  {relative.displayName}
                </Text>
                <Text
                  brand
                  color="onSurfaceVariant"
                  direction={direction}
                  language={language}
                  variant="caption"
                >
                  {t('access.setup.relationship.' + relative.relationship)} ·{' '}
                  {rhythmOptions.find((option) => option.value === relative.rhythm)?.label}
                </Text>
              </View>
            </Row>
            <Row direction={direction} gap={spacing.xs} wrap>
              <Button
                accessibilityLabel={t('access.setup.editRelativeAccessibility', {
                  name: relative.displayName,
                })}
                brand
                direction={direction}
                disabled={disabled}
                fullWidth={false}
                language={language}
                onPress={() => beginEdit(relative)}
                testID={'edit-' + relative.id}
                variant="secondary"
              >
                {t('access.setup.editRelative')}
              </Button>
              <Button
                accessibilityLabel={t('access.setup.removeRelativeAccessibility', {
                  name: relative.displayName,
                })}
                brand
                direction={direction}
                disabled={disabled}
                fullWidth={false}
                language={language}
                onPress={() => removeRelative(relative.id)}
                testID={'remove-' + relative.id}
                variant="quiet"
              >
                {t('access.setup.removeRelative')}
              </Button>
            </Row>
          </View>
        ))}

        {editor ? (
          <View style={styles.editor} testID="relative-inline-editor">
            <Text
              brand
              color="deepForest"
              direction={direction}
              language={language}
              variant="title"
            >
              {t(editor.id ? 'access.setup.editRelativeTitle' : 'access.setup.addRelativeTitle')}
            </Text>
            <AccessTextField
              accessibilityLabel={t('access.setup.relativeNameLabel')}
              autoCapitalize="words"
              autoCorrect={false}
              direction="auto"
              editable={!disabled}
              errorText={
                relativeNameTouched && !nameIsComplete(editor.displayName)
                  ? t('access.setup.relativeNameError')
                  : undefined
              }
              label={t('access.setup.relativeNameLabel')}
              language={language}
              maxLength={40}
              onBlur={() => setRelativeNameTouched(true)}
              onChangeText={(displayName) => setEditor({ ...editor, displayName })}
              onSubmitEditing={saveRelative}
              placeholder={t('access.setup.relativeNamePlaceholder')}
              returnKeyType="done"
              testID="relative-name-input"
              value={editor.displayName}
            />
            <SegmentedControl
              accessibilityLabel={t('access.setup.relationshipLabel')}
              direction={direction}
              disabled={disabled}
              label={t('access.setup.relationshipLabel')}
              language={language}
              onChange={(relationship) => setEditor({ ...editor, relationship })}
              options={relationshipOptions}
              testID="relative-relationship"
              value={editor.relationship}
            />
            <SegmentedControl
              accessibilityLabel={t('access.setup.rhythmLabel')}
              direction={direction}
              disabled={disabled}
              label={t('access.setup.rhythmLabel')}
              language={language}
              onChange={(rhythm) => setEditor({ ...editor, rhythm })}
              options={rhythmOptions}
              testID="relative-rhythm"
              value={editor.rhythm}
            />
            <Row direction={direction} gap={spacing.sm} wrap>
              <Button
                brand
                direction={direction}
                disabled={disabled || !nameIsComplete(editor.displayName)}
                fullWidth={false}
                language={language}
                onPress={saveRelative}
                testID="save-relative"
                variant="primary"
              >
                {t('access.setup.saveRelative')}
              </Button>
              <Button
                brand
                direction={direction}
                disabled={disabled}
                fullWidth={false}
                language={language}
                onPress={() => setEditor(null)}
                testID="cancel-relative"
                variant="quiet"
              >
                {t('access.setup.cancelRelative')}
              </Button>
            </Row>
          </View>
        ) : directory.relatives.length >= 6 ? (
          <Text brand color="onSurface" direction={direction} language={language} variant="caption">
            {t('access.setup.relativeLimit')}
          </Text>
        ) : null}

        <InfoRow
          direction={direction}
          icon="lock"
          language={language}
          message={t('access.setup.peoplePrivacy')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.xs,
  },
  guardianFields: {
    gap: spacing.md,
  },
  relativesSection: {
    gap: spacing.md,
  },
  relativeRow: {
    gap: spacing.md,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
  },
  relativeIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.pill,
    backgroundColor: colors.primaryFixedTint,
  },
  relativeCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
  },
  editor: {
    gap: spacing.lg,
    borderRadius: r001Radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.lg,
  },
});
