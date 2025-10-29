import app from '../../server/src/app.mjs';
import { postTestData, testImageDataAbsoluteUrl } from '../helpers/helpers.mjs';

import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('/api/v1/photo', () => {
  describe('GET', () => {
    it('responds with a status code 200 and all db entries, with absolute urls and no tags', async () => {
      // Setup environment, add data, etc.
      await postTestData();
      // Must return async request otherwise tests won't run properly! Will get incorrectly passing tests.
      const response = await request(app).get('/api/v1/photo');

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'All photos successfully retrieved.',
          photos: testImageDataAbsoluteUrl,
        },
      });
    });
  });
});

describe('/api/v1/photo/:id', () => {
  describe('GET', () => {
    it('with a valid id, responds with a status code 200 and db entry, with absolute url and no tags', async () => {
      await postTestData();
      const response = await request(app).get(
        `/api/v1/photo/${testImageDataAbsoluteUrl[0].id}`,
      );

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Photo successfully retrieved.',
          photo: testImageDataAbsoluteUrl[0],
        },
      });
    });

    it('with an invalid id, responds with a status code 404 and a json message', async () => {
      const response = await request(app).get('/api/v1/photo/my-made-up-id');
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    });
  });
});
