import app from '../../server/src/app.mjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { request } from 'sagetest';

// These tests just concern the responses given by the route in various situations.
// For checking whether protected routes can be accessed, i.e. if admin mode is active for the session,
// those tests will be in the flow tests in tests/app.test.mjs. The reason being, we just want to test
// the specific routes in here, and the flow tests are more like integration tests, where we are accessing
// various routes one after another - failing to access a route, enabling admin mode, then successfully
// accessing the route that was originally inaccessible.
describe('/api/v1/auth/enable-admin', () => {
  describe('POST', () => {
    beforeEach(() => {
      process.env.ADMIN_PASSWORD = 'my password';
    });

    describe('with the correct password', () => {
      it('respond with a 200 status code and a json info message', () => {
        return request(app)
          .post('/api/v1/auth/enable-admin')
          .send({ password: 'my password' })
          .expect(200)
          .expect({
            status: 'success',
            data: {
              message: 'Admin mode enabled.',
            },
          });
      });

      it('respond with a 200 status code and a json info message if admin mode is already enabled', async () => {
        let response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .send({ password: 'my password' });
        expect(response.statusCode).toStrictEqual(200);

        const cookie = response.headers['set-cookie'];

        // Now log in again even though we are already logged in.
        response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .set('cookie', cookie)
          .send({ password: 'an incorrect password' });

        expect(response.statusCode).toStrictEqual(200);
        expect(response.body).toStrictEqual({
          status: 'success',
          data: {
            message: 'Admin mode enabled.',
          },
        });
      });
    });

    it('with an empty password, respond with 401 status code and validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/auth/enable-admin')
        .send({ password: '' });

      expect(response.statusCode).toStrictEqual(401);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          validation: {
            errors: [
              {
                location: 'body',
                msg: 'Password is a required field',
                path: 'password',
                type: 'field',
                value: '',
              },
            ],
          },
        },
      });
    });

    describe('with an incorrect password', () => {
      it('respond with 401 status code and json message', async () => {
        const response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .send({ password: 'my incorrect password' });

        expect(response.statusCode).toStrictEqual(401);
        expect(response.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'Incorrect password.',
          },
        });
      });

      it('with admin mode already enabled, respond with a status code 200 and json message', async () => {
        let response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .send({ password: 'my password' });
        expect(response.statusCode).toStrictEqual(200);

        const cookie = response.headers['set-cookie'];

        response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .set('cookie', cookie)
          .send({ password: 'an incorrect password' });

        expect(response.statusCode).toStrictEqual(200);
        expect(response.body).toStrictEqual({
          status: 'success',
          data: {
            message: 'Admin mode enabled.',
          },
        });
      });
    });
  });
});

describe('/api/v1/auth/disable-admin', () => {
  describe('POST', () => {
    let cookie;

    beforeEach(async () => {
      // Make sure we have a session going already.
      const response = await request(app)
        .post('/api/v1/auth/enable-admin')
        .send({ password: 'my password' });
      cookie = response.headers['set-cookie'];
    });

    it('should respond with a 200 status code and a json info message', () => {
      return request(app)
        .post('/api/v1/auth/disable-admin')
        .expect(200)
        .expect({
          status: 'success',
          data: {
            message: 'Admin mode disabled.',
          },
        });
    });

    it('should respond with a 200 status code and a json info message if admin mode is already disabled', async () => {
      let response = await request(app).post('/api/v1/auth/disable-admin');
      expect(response.statusCode).toStrictEqual(200);

      response = await request(app).post('/api/v1/auth/disable-admin');
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Admin mode disabled.',
        },
      });
    });
  });
});
