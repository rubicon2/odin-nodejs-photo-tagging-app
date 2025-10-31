import app from '../../server/src/app.mjs';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

describe('/api/v1/auth/enable-admin', () => {
  describe('POST', () => {
    beforeEach(() => {
      process.env.ADMIN_ENABLED = 'false';
      process.env.ADMIN_PASSWORD = 'my password';
    });

    describe('with the correct password', () => {
      it('should enable admin mode', async () => {
        await request(app)
          .post('/api/v1/auth/enable-admin')
          .send('password=my password');
        expect(process.env.ADMIN_ENABLED).toStrictEqual('true');
      });

      it('should respond with a 200 status code and a json info message', () => {
        return request(app)
          .post('/api/v1/auth/enable-admin')
          .send('password=my password')
          .expect(200)
          .expect({
            status: 'success',
            data: {
              message: 'Admin mode enabled.',
            },
          });
      });

      it('should respond with a 200 status code and a json info message if admin mode is already enabled', () => {
        process.env.ADMIN_ENABLED = 'true';
        return request(app)
          .post('/api/v1/auth/enable-admin')
          .send('password=my password')
          .expect(200)
          .expect({
            status: 'success',
            data: {
              message: 'Admin mode enabled.',
            },
          });
      });
    });

    it('with an empty password, should not enable admin mode and respond with 401 status code and validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/auth/enable-admin')
        .send(`password=`);

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

      expect(process.env.ADMIN_ENABLED).toStrictEqual('false');
    });

    describe('with an incorrect password', () => {
      it('should not enable admin mode and respond with 401 status code and json message', async () => {
        const response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .send(`password=my incorrect password`);

        expect(response.statusCode).toStrictEqual(401);
        expect(response.body).toStrictEqual({
          status: 'fail',
          data: {
            message: 'Incorrect password.',
          },
        });

        expect(process.env.ADMIN_ENABLED).toStrictEqual('false');
      });

      it('with admin mode already enabled, should respond with a status code 200 and json message', async () => {
        process.env.ADMIN_ENABLED = 'true';
        const response = await request(app)
          .post('/api/v1/auth/enable-admin')
          .send(`password=my incorrect password`);

        expect(response.statusCode).toStrictEqual(200);
        expect(response.body).toStrictEqual({
          status: 'success',
          data: {
            message: 'Admin mode enabled.',
          },
        });

        expect(process.env.ADMIN_ENABLED).toStrictEqual('true');
      });
    });
  });
});

describe('/api/v1/auth/disable-admin', () => {
  describe('POST', () => {
    beforeEach(() => {
      process.env.ADMIN_ENABLED = 'true';
    });

    it('should disable admin mode', async () => {
      await request(app).post('/api/v1/auth/disable-admin');
      expect(process.env.ADMIN_ENABLED).toStrictEqual('false');
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

    it('should respond with a 200 status code and a json info message if admin mode is already disabled', () => {
      process.env.ADMIN_ENABLED = 'false';
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
  });
});
