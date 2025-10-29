import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // This directory contains the integration tests.
    include: ['./tests/**/*.test.*'],
    exclude: ['./tests/helpers/*'],
    // With integration tests, they will be hitting the test
    // database, so make sure tests do not run at the same time.
    fileParallelism: false,
    setupFiles: ['./tests/helpers/setup.mjs'],
  },
});
