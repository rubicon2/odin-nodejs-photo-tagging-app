import v1 from '../../src/routers/api/v1.mjs';
import express from 'express';
import { describe, it, expect } from 'vitest';
import request from 'supertest';

const app = express();
app.use(v1);

// Before all tests, clear test db and fill with test data.

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

  it('GET /photo returns all photo entries on the db', () => {
    // Guess we'll need a test db for this.

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
            photos: [],
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
