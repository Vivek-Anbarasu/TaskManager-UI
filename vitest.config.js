import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      exclude: [
        '**/.pnp.cjs',
        '**/node_modules/**',
        '**/test/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/coverage/**',
        '**/*.config.{js,ts}',
        '**/src/assets/**',
        '**/src/css/**',
      ],
    },
  },
});
