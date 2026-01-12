import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akashohk1.app',
  appName: 'Payment Soft',
  webDir: 'out',
  server: {
    url: 'https://aaryatechnologies.vercel.app',
    cleartext: true
  }
};

export default config;
