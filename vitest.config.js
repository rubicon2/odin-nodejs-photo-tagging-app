import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // With integration tests, they will be hitting the test
    // database, so make sure tests do not run at the same time.
    threads: false,
  },
});
