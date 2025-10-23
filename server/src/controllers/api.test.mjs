import * as api from './api.mjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRequest, createResponse } from 'node-mocks-http';

let req;
let res;

beforeEach(() => {
  // Defaults.
  req = createRequest();
  res = createResponse();
});

// Only testing postEnableAdminMode and postDisableAdminMode here. Everything
// else will go in the integration tests since they hit the database, etc.
describe('api controller', () => {
  it.each(
    Object.keys(api).map((controllerName) => ({
      name: controllerName,
      fn: api[controllerName],
    })),
  )('$name should be of type function', ({ fn }) => {
    expect(typeof fn).toStrictEqual('function');
  });

  describe('postEnableAdminMode', () => {
    beforeEach(() => {
      process.env.ADMIN_ENABLED = 'false';
      process.env.ADMIN_PASSWORD = 'my password';
    });

    describe('when called with the correct password', () => {
      beforeEach(() => {
        req = createRequest({
          method: 'post',
          body: { password: 'my password' },
        });
      });

      it('should enable admin mode', () => {
        api.postEnableAdminMode(req, res);
        expect(process.env.ADMIN_ENABLED).toStrictEqual('true');
      });

      it('should respond with a 200 status code and a json info message', async () => {
        api.postEnableAdminMode(req, res);
        expect(res.statusCode).toStrictEqual(200);
        expect(res._isJSON()).toStrictEqual(true);
        expect(res._getJSONData()).toStrictEqual({
          status: 'success',
          data: {
            message: 'Admin mode enabled.',
          },
        });
      });

      it('should respond with a 200 status code and a json info message if admin mode is already enabled', () => {
        process.env.ADMIN_ENABLED = 'true';
        api.postEnableAdminMode(req, res);
        expect(res.statusCode).toStrictEqual(200);
        expect(res._isJSON()).toStrictEqual(true);
        expect(res._getJSONData()).toStrictEqual({
          status: 'success',
          data: {
            message: 'Admin mode enabled.',
          },
        });
      });
    });

    describe('when called with an incorrect password', () => {
      beforeEach(() => {
        req = createRequest({
          method: 'post',
          body: { password: 'my incorrect password' },
        });
      });

      it('should not enable admin mode', () => {
        api.postEnableAdminMode(req, res);
        expect(process.env.ADMIN_ENABLED).toStrictEqual('false');
      });

      it('should respond with a 401 status code and a json info message', () => {
        api.postEnableAdminMode(req, res);
        expect(res.statusCode).toStrictEqual(401);
        expect(res._isJSON()).toStrictEqual(true);
        expect(res._getJSONData()).toStrictEqual({
          status: 'fail',
          data: {
            message: 'Password was not correct, admin mode was not enabled.',
          },
        });
      });

      it('should respond with a 200 status code and a json info message if admin mode is already enabled', () => {
        process.env.ADMIN_ENABLED = 'true';
        api.postEnableAdminMode(req, res);
        expect(res.statusCode).toStrictEqual(200);
        expect(res._isJSON()).toStrictEqual(true);
        expect(res._getJSONData()).toStrictEqual({
          status: 'success',
          data: {
            message: 'Admin mode enabled.',
          },
        });
      });
    });
  });

  describe('postDisableAdminMode', () => {
    beforeEach(() => {
      process.env.ADMIN_ENABLED = 'true';
      req = createRequest({ method: 'post' });
    });

    it('should disable admin mode', () => {
      api.postDisableAdminMode(req, res);
      expect(process.env.ADMIN_ENABLED).toStrictEqual('false');
    });

    it('should respond with a 200 status code and a json info message', () => {
      api.postDisableAdminMode(req, res);
      expect(res.statusCode).toStrictEqual(200);
      expect(res._isJSON()).toStrictEqual(true);
      expect(res._getJSONData()).toStrictEqual({
        status: 'success',
        data: {
          message: 'Admin mode disabled.',
        },
      });
    });

    it('should respond with a 200 status code and a json info message if admin mode is already disabled', () => {
      process.env.ADMIN_ENABLED = 'false';
      api.postDisableAdminMode(req, res);
      expect(res.statusCode).toStrictEqual(200);
      expect(res._isJSON()).toStrictEqual(true);
      expect(res._getJSONData()).toStrictEqual({
        status: 'success',
        data: {
          message: 'Admin mode disabled.',
        },
      });
    });
  });
});
