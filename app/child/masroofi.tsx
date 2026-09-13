import { Redirect } from 'expo-router';

import { MasroofiChildScreen } from '@/components/masroofi/MasroofiChildScreen';
import { masroofiDemoEnabled } from '@/config/masroofi';

export default function ChildMasroofiRoute() {
  if (!masroofiDemoEnabled) return <Redirect href="/child" />;
  return <MasroofiChildScreen />;
}
