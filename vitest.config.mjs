import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/web/src', import.meta.url)),
      '@friends-dictation/shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
      '@friends-dictation/database': fileURLToPath(new URL('./packages/database/src', import.meta.url)),
    },
  },
});