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
  describe('if process.env.ADMIN_ENABLED is not equal to "true"', () => {
    process.env.ADMIN_ENABLED = 'false';

    it('does not call next middleware', () => {
      isAdmin(req, res, next);
      expect(next.mock.calls).toHaveLength(0);
    });

    it('responds with a 403 status code and json message', () => {
      isAdmin(req, res, next);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('if process.env.ADMIN_ENABLED is equal to "true"', () => {
    it('calls next middleware', () => {
      process.env.ADMIN_ENABLED = 'true';
      isAdmin(req, res, next);
      expect(next.mock.calls).toHaveLength(1);
    });
  });
});
