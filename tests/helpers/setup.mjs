import { clearDb, clearFiles } from './helpers.mjs';
import { beforeEach } from 'vitest';

beforeEach(async () => {
  await clearFiles();
  await clearDb();
});
