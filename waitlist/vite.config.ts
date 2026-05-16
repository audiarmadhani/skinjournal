import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Load waitlist/.env and repo-root .env (same Supabase keys as the Expo app)
  envDir: '..',
  envPrefix: ['VITE_', 'EXPO_PUBLIC_'],
});
