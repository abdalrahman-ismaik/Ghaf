import { Redirect, Slot } from 'expo-router';

import { entryMode } from '@/config/demoEntry';

export default function OrdinaryAccessLayout() {
  return entryMode === 'demo' ? <Redirect href="/" /> : <Slot />;
}
