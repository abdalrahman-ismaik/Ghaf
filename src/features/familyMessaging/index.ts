import { SupabaseFamilyMessagingService, readMessagingConfig } from './client';
import { FamilyMessagingController } from './controller';
import { createCredentialStorage } from './credentialStorage';

export function createFamilyMessaging() {
  const service = new SupabaseFamilyMessagingService(
    readMessagingConfig(
      process.env.EXPO_PUBLIC_GHAF_MESSAGING_URL,
      process.env.EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY,
    ),
    createCredentialStorage(),
  );
  const controller = new FamilyMessagingController(service, async () => {
    const crypto = await import('expo-crypto');
    return crypto.randomUUID();
  });
  return { service, controller };
}
export * from './contracts';
