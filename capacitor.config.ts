import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'jeeva-app',
  webDir: 'dist',  // Change this from 'build' to 'dist'
  server: {
    androidScheme: 'https'
  }
};

export default config;