import v1 from '../server/src/routers/api/v1/v1.mjs';
import { postTestData, testImageDataAbsoluteUrl } from './helpers/helpers.mjs';
import express from 'express';
import { describe, it, expect } from 'vitest';
import request from 'supertest';

const app = express();
app.use(v1);

describe('v1 api', () => {
  it('GET /photo returns all photo entries on the db, with absolute urls', async () => {
    // Setup environment, add data, etc.
    await postTestData();

    // Must return async request otherwise tests won't run properly! Will get incorrectly passing tests.
    return request(app)
      .get('/photo')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: 'success',
          data: {
            message: 'All photos successfully retrieved.',
            photos: testImageDataAbsoluteUrl,
          },
        });
      });
  });

  it('GET /photo/:id returns db entry for matching photo id', async () => {
    await postTestData();

    return request(app)
      .get(`/photo/${testImageDataAbsoluteUrl[0].id}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: 'success',
          data: {
            message: 'Photo successfully retrieved.',
            photo: testImageDataAbsoluteUrl[0],
          },
        });
      });
  });

  it('Rejects any requests to /admin routes unless env variable VITE_IS_ADMIN is true', () => {
    process.env.VITE_IS_ADMIN = 'false';
    return request(app).get('/admin').expect(403);
  });
});
