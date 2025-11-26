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
  describe('if req.session.admin is not equal to "true"', () => {
    req = httpMocks.createRequest({
      session: {
        admin: false,
      },
    });

    it('does not call next middleware', () => {
      isAdmin(req, res, next);
      expect(next.mock.calls).toHaveLength(0);
    });

    it('responds with a 403 status code and json message', () => {
      isAdmin(req, res, next);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('if req.session.admin is equal to "true"', () => {
    it('calls next middleware', () => {
      req = httpMocks.createRequest({
        session: {
          admin: true,
        },
      });
      isAdmin(req, res, next);
      expect(next.mock.calls).toHaveLength(1);
    });
  });
});
