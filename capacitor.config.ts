import type { CapacitorConfig } from '@capacitor/cli';

// TODO before TestFlight: bundle id, app name, real splash + icon assets.
const config: CapacitorConfig = {
  appId: 'com.arabiziapp.mvp',
  appName: 'Arabizi App',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
  backgroundColor: '#F7F3EC',
};

export default config;
