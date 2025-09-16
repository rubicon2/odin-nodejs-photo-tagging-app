import app from '../server/src/app.mjs';
import { describe, it, expect } from 'vitest';

describe('app', () => {
  it('default export should have a listen function for responding to requests', () => {
    expect(typeof app.listen).toBe('function');
  });
});
