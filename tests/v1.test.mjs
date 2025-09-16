import v1 from '../server/src/routers/api/v1.mjs';
import {
  postTestData,
  testImageData,
  testImageDataAbsoluteUrl,
  testImageTagData,
} from './helpers/helpers.mjs';
import express from 'express';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

const app = express();
app.use(v1);

describe('v1 api', () => {
  it('GET / returns test message', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: 'success',
          data: {
            message: 'A message from the api.',
          },
        });
      });
  });

  it('GET /photo returns all photo entries on the db', async () => {
    // Add test data.
    await postTestData();

    process.env.VITE_IS_ADMIN = 'false';

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

  it.skip('GET /photo returns all photo entries on the db and includes tags in dev mode', (done) => {});

  it.skip('GET /photo/:id returns db entry for matching photo id', (done) => {});

  it.skip('GET /photo/:id returns db entry for matching photo id and includes tags in dev mode', (done) => {});

  it.skip('POST /photo creates a new db entry when in dev mode', (done) => {});

  it.skip('PUT /photo/:id updates an existing db entry when in dev mode', (done) => {});
});
