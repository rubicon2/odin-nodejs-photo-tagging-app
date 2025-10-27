import app from '../server/src/app.mjs';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

describe('/api/v1/auth', () => {
  describe('/enable-admin', () => {
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

      describe('with an incorrect password', () => {
        it('should not enable admin mode', async () => {
          await request(app)
            .post('/api/v1/auth/enable-admin')
            .send('password=my incorrect password');
          expect(process.env.ADMIN_ENABLED).toStrictEqual('false');
        });

        it('should respond with a 401 status code and a json info message', () => {
          return request(app)
            .post('/api/v1/auth/enable-admin')
            .send('password=my incorrect password')
            .expect(401)
            .expect({
              status: 'fail',
              data: {
                message: 'Incorrect password.',
              },
            });
        });

        it('should respond with a 200 status code and a json info message if admin mode is already enabled', () => {
          process.env.ADMIN_ENABLED = 'true';
          return request(app)
            .post('/api/v1/auth/enable-admin')
            .send('password=my incorrect password')
            .expect(200)
            .expect({
              status: 'success',
              data: {
                message: 'Admin mode enabled.',
              },
            });
        });
      });
    });
  });

  describe('/disable-admin', () => {
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
});
