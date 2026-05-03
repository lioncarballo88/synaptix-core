import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    clearMocks: true,
    coverage: {
      reporter: ['text', 'lcov'],
      all: true,
      threshold: 80,
    },
  },
});
