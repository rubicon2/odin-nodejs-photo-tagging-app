import app from '../src/app.mjs';
import { describe, it, expect } from '@jest/globals';

describe('app', () => {
  it('default export should have a listen function for responding to requests', () => {
    expect(typeof app.listen).toBe('function');
  });
});
