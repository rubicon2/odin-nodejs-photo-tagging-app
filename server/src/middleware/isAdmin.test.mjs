import isAdmin from './isAdmin.mjs';
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

describe('isAdmin', () => {
  it('does not call next middleware if process.env.VITE_IS_ADMIN is not equal to "true"', () => {
    process.env.VITE_IS_ADMIN = 'literally anything else';
    expect(() => isAdmin(req, res, next)).toThrow(
      'Can only access this route as admin',
    );
    expect(next.mock.calls).toHaveLength(0);
  });

  it('calls next middleware if process.env.MODE equals "true"', () => {
    process.env.VITE_IS_ADMIN = 'true';
    isAdmin(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
  });
});
