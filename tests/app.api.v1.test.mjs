import app from '../server/src/app.mjs';
import { postTestData, testImageDataAbsoluteUrl } from './helpers/helpers.mjs';

import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('/api/v1', () => {
  describe('/photo', () => {
    describe('GET', () => {
      it('GET returns all db entries, with absolute urls and no tags', async () => {
        // Setup environment, add data, etc.
        await postTestData();
        // Must return async request otherwise tests won't run properly! Will get incorrectly passing tests.
        return request(app)
          .get('/api/v1/photo')
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
    });

    describe('/:id', () => {
      describe('GET', () => {
        it('returns db entry for matching photo id, with absolute url and no tags', async () => {
          await postTestData();
          return request(app)
            .get(`/api/v1/photo/${testImageDataAbsoluteUrl[0].id}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).toStrictEqual({
                status: 'success',
                data: {
                  message: 'Photo successfully retrieved.',
                  photo: testImageDataAbsoluteUrl[0],
                },
              });
            });
        });

        it('responds with a 404 status code and json message if there is no entry for the id', () => {
          return request(app)
            .get('/api/v1/photo/my-made-up-id')
            .expect(404)
            .expect({
              status: 'fail',
              data: {
                message: 'That photo does not exist.',
              },
            });
        });
      });
    });
  });
});
