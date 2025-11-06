import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        '.next',
        'tests',
        '*.config.*',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@/lib': path.resolve(__dirname, './apps/web/src/lib'),
      '@/app': path.resolve(__dirname, './apps/web/src/app'),
      '@friends-dictation/database': path.resolve(__dirname, './packages/database/src'),
      '@friends-dictation/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});