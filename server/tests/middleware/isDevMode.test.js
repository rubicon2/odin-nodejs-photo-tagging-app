import isDevMode from '../../src/middleware/isDevMode.mjs';
import { beforeEach, vi, describe, it, expect } from 'vitest';
import httpMocks from 'node-mocks-http';

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = vi.fn();
});

describe('isDevMode', () => {
  it('does not call next middleware if process.env.MODE is not equal to "development"', () => {
    process.env.MODE = 'literally anything else';
    expect(() => isDevMode(req, res, next)).toThrow(
      'Can only access this route in development mode',
    );
    expect(next.mock.calls).toHaveLength(0);
  });

  it('calls next middleware if process.env.MODE equals "development"', () => {
    process.env.MODE = 'development';
    isDevMode(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
  });
});
