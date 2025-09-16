import { clearDb } from './helpers.mjs';
import { beforeEach } from 'vitest';

beforeEach(async () => {
  await clearDb();
});
