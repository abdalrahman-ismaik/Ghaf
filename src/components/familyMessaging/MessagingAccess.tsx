import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';

import { Input } from '@/components/primitives';
import type {
  FamilyMessagingController,
  MessagingState,
} from '@/features/familyMessaging/controller';
import type { MessagingRole } from '@/features/familyMessaging';
import { MessageButton, MessageText, styles } from './shared';

export function MessagingAccess({
  controller,
  state,
}: {
  controller: FamilyMessagingController;
  state: MessagingState;
}) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<MessagingRole>('parent');
  const mode = state.expectedRole ?? choice;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const busy = state.busy || state.phase === 'authenticating';
  const valid = label.trim() && (mode === 'parent' ? email.trim() && password : code.trim());
  return (
    <View style={styles.group} testID="messaging-access">
      {Platform.OS === 'web' ? (
        <MessageText variant="caption" color="onSurfaceVariant">
          {t('messaging.webSession')}
        </MessageText>
      ) : null}
      <MessageText accessibilityRole="header" variant="heading">
        {t(mode === 'parent' ? 'messaging.authTitle' : 'messaging.enrollTitle')}
      </MessageText>
      <MessageText color="onSurfaceVariant">
        {t(mode === 'parent' ? 'messaging.authBody' : 'messaging.enrollBody')}
      </MessageText>
      {!state.expectedRole ? (
        <View style={styles.row}>
          {(['parent', 'child'] as const).map((role) => (
            <MessageButton
              key={role}
              fullWidth={false}
              variant={mode === role ? 'primary' : 'secondary'}
              disabled={busy}
              accessibilityState={{ selected: mode === role }}
              onPress={() => setChoice(role)}
            >
              {t(`messaging.${role}`)}
            </MessageButton>
          ))}
        </View>
      ) : null}
      {mode === 'parent' ? (
        <>
          <Input
            brand
            label={t('messaging.email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            direction="ltr"
            value={email}
            onChangeText={setEmail}
            editable={!busy}
            maxLength={254}
          />
          <Input
            brand
            label={t('messaging.password')}
            autoComplete="current-password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!busy}
            maxLength={1024}
          />
        </>
      ) : (
        <Input
          brand
          label={t('messaging.code')}
          autoCapitalize="none"
          autoCorrect={false}
          direction="ltr"
          value={code}
          onChangeText={setCode}
          editable={!busy}
          maxLength={128}
        />
      )}
      <Input
        brand
        label={t('messaging.deviceLabel')}
        value={label}
        onChangeText={setLabel}
        editable={!busy}
        maxLength={60}
      />
      <MessageButton
        disabled={!valid}
        busy={busy}
        busyLabel={t('messaging.working')}
        onPress={() => {
          const values = { email: email.trim(), password, code: code.trim(), label: label.trim() };
          setPassword('');
          setCode('');
          void controller.authenticate(mode, values);
        }}
      >
        {t(mode === 'parent' ? 'messaging.signIn' : 'messaging.enroll')}
      </MessageButton>
    </View>
  );
}
