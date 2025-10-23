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
  it('does not call next middleware and returns a 403 (forbidden) if process.env.ADMIN_ENABLED is not equal to "true"', () => {
    process.env.ADMIN_ENABLED = 'false';
    isAdmin(req, res, next);
    expect(next.mock.calls).toHaveLength(0);
    expect(res.statusCode).toEqual(403);
  });

  it('calls next middleware if process.env.ADMIN_ENABLED equals "true"', () => {
    process.env.ADMIN_ENABLED = 'true';
    isAdmin(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
  });
});
