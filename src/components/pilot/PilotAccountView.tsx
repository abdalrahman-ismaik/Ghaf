import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessHeader,
  AccessScreen,
  AccessTextField,
  normalizeOtpDigits,
  StatusBanner,
} from '@/components/access';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Text } from '@/components/primitives';
import { colors, layout, logicalRowDirection, spacing } from '@/design/tokens';
import type { PilotController, PilotState } from '@/features/pilot/controller';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface PilotAccountViewProps {
  readonly controller: PilotController;
  readonly state: PilotState;
  readonly children?: ReactNode;
}

export function PilotAccountView({ controller, state, children }: PilotAccountViewProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((current) => current.locale);
  const direction = usePrototypeStore((current) => current.direction);
  const [email, setEmail] = useState(state.email);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [code, setCode] = useState('');
  const phase = state.phase;
  const accountPanel = state.accountPanel && state.sampleOpen;
  const hasEmail = phase === 'signin' || phase === 'register' || phase === 'forgot';
  const hasPassword = phase === 'signin' || phase === 'register' || phase === 'new-password';
  const hasCode = phase === 'verify' || phase === 'recovery-code';
  const codeIsComplete = /^(?:[0-9]{6}|[0-9]{8})$/.test(code);
  const canReturn = ['register', 'verify', 'forgot', 'recovery-code'].includes(phase);
  const canSignOut = [
    'verify',
    'recovery-code',
    'new-password',
    'pending',
    'suspended',
    'ready',
    'error',
    'logout-error',
  ].includes(phase);
  const canRefresh = ['pending', 'suspended', 'error', 'logout-error'].includes(phase);
  const draft = state.profileDraft;
  const profileAvailable =
    phase === 'ready' &&
    state.profile?.userId === state.account?.userId &&
    draft?.userId === state.account?.userId;
  const profileNameLength = Array.from(draft?.displayName.trim() ?? '').length;
  const submit = () => {
    if (state.busy || (hasCode && !codeIsComplete)) return;
    const submittedPassword = password;
    const submittedCode = code;
    setPassword('');
    setPasswordVisible(false);
    setCode('');
    if (phase === 'signin') void controller.signIn(email, submittedPassword);
    else if (phase === 'register') void controller.register(email, submittedPassword);
    else if (phase === 'forgot') void controller.requestRecovery(email);
    else if (phase === 'verify') void controller.verify(submittedCode);
    else if (phase === 'recovery-code') void controller.verifyRecovery(submittedCode);
    else if (phase === 'new-password') void controller.updatePassword(submittedPassword);
  };
  const actionLabel =
    phase === 'signin'
      ? 'signIn'
      : phase === 'register'
        ? 'register'
        : phase === 'forgot'
          ? 'sendRecovery'
          : phase === 'verify'
            ? 'verify'
            : phase === 'recovery-code'
              ? 'verifyRecovery'
              : 'updatePassword';
  const formIsComplete =
    (!hasEmail || email.trim().length > 0) &&
    (!hasPassword || password.length > 0) &&
    (!hasCode || codeIsComplete);
  const goBack = () => {
    setPassword('');
    setPasswordVisible(false);
    setCode('');
    if (accountPanel) controller.continueSample();
    else controller.showForm('signin');
  };

  return (
    <AccessScreen
      background="organic"
      contentMaxWidth={layout.readableContentWidth}
      contentStyle={styles.content}
      header={
        <AccessHeader
          brand={t('common.brand')}
          backLabel={t('common.back')}
          direction={direction}
          language={locale}
          onBack={accountPanel || (canReturn && !state.busy) ? goBack : undefined}
          title={t('pilot.label')}
        />
      }
      keyboardAware
      testID={`pilot-${accountPanel ? 'account' : phase}-screen`}
    >
      <LanguageSwitcher compact showGuidance={false} testID="pilot-language-switcher" />
      <View style={styles.intro}>
        <Text brand align="center" color="deepForest" variant="parentHero">
          {t(accountPanel ? 'pilot.accountTitle' : `pilot.status.${phase}.title`)}
        </Text>
        <Text brand align="center" color="onSurfaceVariant">
          {t(accountPanel ? 'pilot.accountBody' : `pilot.status.${phase}.body`)}
        </Text>
        {(hasCode || ['pending', 'suspended', 'ready'].includes(phase)) && state.email ? (
          <Text
            brand
            align="center"
            direction="ltr"
            selectable
            testID="pilot-account-email"
            variant="label"
          >
            {state.email}
          </Text>
        ) : null}
      </View>

      {phase === 'ready' ? (
        <Button
          brand
          onPress={() => void controller.signOut()}
          variant="quiet"
          testID="pilot-signout"
        >
          {t('pilot.signOut')}
        </Button>
      ) : null}
      {phase === 'ready' ? children : null}

      {state.error ? (
        <StatusBanner
          direction={direction}
          language={locale}
          tone="error"
          message={t(`pilot.errors.${state.error}`)}
        />
      ) : null}
      {state.notice ? (
        <StatusBanner
          direction={direction}
          language={locale}
          tone="success"
          message={t(state.notice === 'code_sent' ? 'pilot.codeSent' : 'pilot.passwordUpdated')}
        />
      ) : null}

      {phase === 'restoring' ? (
        <ActivityIndicator
          accessibilityLabel={t('pilot.working')}
          color={colors.ghafEmerald}
          size="large"
        />
      ) : null}

      {hasEmail || hasPassword || hasCode ? (
        <View style={styles.form}>
          {hasEmail ? (
            <AccessTextField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              direction={direction}
              editable={!state.busy}
              keyboardType="email-address"
              label={t('pilot.email')}
              language={locale}
              maxLength={320}
              onChangeText={setEmail}
              onSubmitEditing={phase === 'forgot' ? submit : undefined}
              placeholder={t('pilot.emailPlaceholder')}
              returnKeyType={phase === 'forgot' ? 'go' : 'next'}
              style={styles.latinInput}
              testID="pilot-email-input"
              textContentType="emailAddress"
              value={email}
            />
          ) : null}
          {hasPassword ? (
            <AccessTextField
              autoCapitalize="none"
              autoComplete={phase === 'signin' ? 'current-password' : 'new-password'}
              autoCorrect={false}
              direction="auto"
              editable={!state.busy}
              helperText={phase === 'signin' ? undefined : t('pilot.passwordHint')}
              label={t(phase === 'new-password' ? 'pilot.newPassword' : 'pilot.password')}
              language={locale}
              maxLength={256}
              onChangeText={setPassword}
              onSubmitEditing={submit}
              returnKeyType="go"
              secureTextEntry={!passwordVisible}
              testID="pilot-password-input"
              textContentType={phase === 'signin' ? 'password' : 'newPassword'}
              value={password}
            />
          ) : null}
          {hasPassword ? (
            <Button
              brand
              disabled={state.busy}
              onPress={() => setPasswordVisible((visible) => !visible)}
              testID="pilot-toggle-password"
              variant="quiet"
            >
              {t(passwordVisible ? 'pilot.hidePassword' : 'pilot.showPassword')}
            </Button>
          ) : null}
          {hasCode ? (
            <AccessTextField
              autoCapitalize="none"
              autoComplete="one-time-code"
              autoCorrect={false}
              direction={direction}
              editable={!state.busy}
              helperText={t('pilot.codeHint')}
              inputMode="numeric"
              keyboardType="number-pad"
              label={t('pilot.code')}
              language={locale}
              maxLength={8}
              onChangeText={(value) => setCode(normalizeOtpDigits(value).slice(0, 8))}
              onSubmitEditing={submit}
              returnKeyType="go"
              style={styles.latinInput}
              testID="pilot-code-input"
              textContentType="oneTimeCode"
              value={code}
            />
          ) : null}
          {phase === 'register' ? (
            <Text brand color="onSurfaceVariant" variant="caption">
              {t('pilot.adultOnly')}
            </Text>
          ) : null}
          <Button
            brand
            busy={state.busy}
            busyLabel={t('pilot.working')}
            disabled={!formIsComplete}
            onPress={submit}
            size="regular"
            testID="pilot-submit"
          >
            {t(`pilot.${actionLabel}`)}
          </Button>
          {state.error === 'email_not_verified' && hasEmail ? (
            <Button
              brand
              disabled={state.busy || !email.trim()}
              onPress={() => controller.continueVerification(email)}
              variant="secondary"
              testID="pilot-continue-verification"
            >
              {t('pilot.verify')}
            </Button>
          ) : null}
          {hasCode ? (
            <Button
              brand
              disabled={state.busy}
              onPress={() => {
                setCode('');
                if (phase === 'verify') void controller.resend();
                else void controller.requestRecovery(state.email);
              }}
              variant="secondary"
              testID="pilot-resend-code"
            >
              {t('pilot.resend')}
            </Button>
          ) : null}
        </View>
      ) : null}

      {phase === 'ready' ? (
        <View style={styles.form} testID="pilot-cloud-profile">
          <Text brand color="deepForest" variant="label">
            {t('pilot.profile.title')}
          </Text>
          <Text brand color="onSurfaceVariant" variant="caption">
            {t('pilot.profile.body')}
          </Text>
          {state.profileError ? (
            <StatusBanner
              direction={direction}
              language={locale}
              tone="error"
              message={t(`pilot.errors.${state.profileError}`)}
            />
          ) : null}
          {state.profileNotice === 'saved' ? (
            <StatusBanner
              direction={direction}
              language={locale}
              tone="success"
              message={t('pilot.profile.saved')}
            />
          ) : null}
          {state.profileBusy && !state.profile ? (
            <ActivityIndicator
              accessibilityLabel={t('pilot.profile.loading')}
              color={colors.ghafEmerald}
              testID="pilot-profile-loading"
            />
          ) : null}
          {profileAvailable && draft ? (
            <>
              <AccessTextField
                autoCapitalize="words"
                autoComplete="name"
                direction={direction}
                editable={!state.busy}
                helperText={t('pilot.profile.nameHint')}
                label={t('pilot.profile.displayName')}
                language={locale}
                maxLength={160}
                onChangeText={(displayName) => controller.editProfile({ displayName })}
                onSubmitEditing={() => void controller.saveProfile()}
                returnKeyType="done"
                testID="pilot-profile-name"
                textContentType="name"
                value={draft.displayName}
              />
              <Text brand color="onSurfaceVariant" variant="caption">
                {t('pilot.profile.language')}
              </Text>
              <View style={[styles.languages, { flexDirection: logicalRowDirection(direction) }]}>
                {(['ar', 'en'] as const).map((preferredLocale) => (
                  <Button
                    key={preferredLocale}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: draft.preferredLocale === preferredLocale }}
                    brand
                    disabled={state.busy}
                    fullWidth={false}
                    onPress={() => controller.editProfile({ preferredLocale })}
                    style={styles.language}
                    testID={`pilot-profile-language-${preferredLocale}`}
                    variant={draft.preferredLocale === preferredLocale ? 'primary' : 'secondary'}
                  >
                    {t(`pilot.profile.${preferredLocale}`)}
                  </Button>
                ))}
              </View>
              {state.profileDirty ? (
                <Text
                  brand
                  color="onSurfaceVariant"
                  testID="pilot-profile-unsaved"
                  variant="caption"
                >
                  {t('pilot.profile.unsaved')}
                </Text>
              ) : null}
              <Button
                brand
                busy={state.profileBusy}
                busyLabel={t('pilot.working')}
                disabled={
                  state.busy ||
                  !state.profileDirty ||
                  profileNameLength < 1 ||
                  profileNameLength > 80 ||
                  state.profileError === 'profile_conflict'
                }
                onPress={() => void controller.saveProfile()}
                testID="pilot-profile-save"
              >
                {t('pilot.profile.save')}
              </Button>
            </>
          ) : null}
          <Button
            brand
            disabled={state.busy}
            onPress={() => void controller.reloadProfile()}
            testID="pilot-profile-reload"
            variant="secondary"
          >
            {t(state.profileDirty ? 'pilot.profile.discardReload' : 'pilot.profile.reload')}
          </Button>
        </View>
      ) : null}

      <View style={styles.actions}>
        {phase === 'signin' ? (
          <>
            <Button
              brand
              disabled={state.busy}
              onPress={() => controller.showForm('register')}
              variant="secondary"
              testID="pilot-register-link"
            >
              {t('pilot.register')}
            </Button>
            <Button
              brand
              disabled={state.busy}
              onPress={() => controller.showForm('forgot')}
              variant="quiet"
              testID="pilot-forgot-link"
            >
              {t('pilot.forgot')}
            </Button>
          </>
        ) : null}
        {phase === 'ready' ? (
          <>
            <View style={styles.disclosure}>
              <Text brand color="deepForest" variant="label">
                {t('pilot.sampleLabel')}
              </Text>
              <Text brand color="onSurfaceVariant" variant="caption">
                {t('pilot.samplePrivacy')}
              </Text>
              <Text brand color="onSurfaceVariant" variant="caption">
                {t('pilot.sampleTemporary')}
              </Text>
            </View>
            {accountPanel ? (
              <>
                <Button
                  brand
                  onPress={() => controller.continueSample()}
                  size="regular"
                  testID="pilot-continue-sample"
                >
                  {t('pilot.continueSample')}
                </Button>
                <Button
                  brand
                  disabled={state.busy}
                  onPress={() => controller.restartSample()}
                  variant="secondary"
                  testID="pilot-restart-sample"
                >
                  {t('pilot.restart')}
                </Button>
                <Text brand color="onSurfaceVariant" variant="caption">
                  {t('pilot.restartHint')}
                </Text>
              </>
            ) : (
              <Button
                brand
                busy={state.busy}
                busyLabel={t('pilot.working')}
                onPress={() => void controller.explore()}
                size="regular"
                testID="pilot-explore-sample"
              >
                {t('pilot.explore')}
              </Button>
            )}
          </>
        ) : null}
        {canRefresh ? (
          <Button
            brand
            busy={state.busy}
            busyLabel={t('pilot.working')}
            onPress={() => void controller.refresh()}
            size="regular"
            testID="pilot-refresh"
          >
            {t(phase === 'error' || phase === 'logout-error' ? 'pilot.retry' : 'pilot.refresh')}
          </Button>
        ) : null}
        {canReturn ? (
          <Button
            brand
            disabled={state.busy}
            onPress={goBack}
            variant="quiet"
            testID="pilot-return-signin"
          >
            {t('pilot.returnToSignIn')}
          </Button>
        ) : null}
        {canSignOut && phase !== 'ready' ? (
          <Button
            brand
            onPress={() => {
              setPassword('');
              setPasswordVisible(false);
              setCode('');
              void controller.signOut();
            }}
            variant="quiet"
            testID="pilot-signout"
          >
            {t('pilot.signOut')}
          </Button>
        ) : null}
      </View>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.md },
  intro: { gap: spacing.sm, width: '100%' },
  form: { gap: spacing.md, width: '100%' },
  latinInput: { textAlign: 'left', writingDirection: 'ltr' },
  languages: { gap: spacing.sm, flexWrap: 'wrap' },
  language: { flexGrow: 1, flexBasis: 120 },
  actions: { gap: spacing.sm, width: '100%' },
  disclosure: { gap: spacing.xs, paddingBottom: spacing.sm },
});
