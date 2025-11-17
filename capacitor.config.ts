import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoPoints.App',
  appName: 'EcoPoints',
  // Correcting 'webDir' to 'build' based on your project's configuration
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  // The 'plugins' block is the correct place for plugin-specific configurations
  plugins: {
    Camera: {
      permissions: [
        {
          alias: "camera",
          reason: "Necesitamos acceso a la cámara para escanear los códigos QR de las estaciones de reciclaje."
        }
      ]
    }
  }
};

export default config;