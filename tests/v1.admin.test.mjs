import admin from '../server/src/routers/api/v1/v1.admin.mjs';
import db from '../server/src/db/client.mjs';
import {
  postTestData,
  testImageDataAbsoluteUrlWithTags,
} from './helpers/helpers.mjs';
import express from 'express';
import { describe, it, expect } from 'vitest';
import request from 'supertest';

const app = express();
app.use(admin);

describe('v1 admin api', () => {
  it('GET /photo returns all photo entries on the db, with absolute urls and includes tags', async () => {
    await postTestData();
    return request(app)
      .get('/photo')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: 'success',
          data: {
            message: 'All photos with tags successfully retrieved.',
            photos: testImageDataAbsoluteUrlWithTags,
          },
        });
      });
  });

  it('GET /photo/:id returns db entry for matching photo id and includes tags', async () => {
    await postTestData();
    return request(app)
      .get(`/photo/${testImageDataAbsoluteUrlWithTags[0].id}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: 'success',
          data: {
            message: 'Photo with tags successfully retrieved.',
            photo: testImageDataAbsoluteUrlWithTags[0],
          },
        });
      });
  });

  it('POST /photo creates a new db entry', async () => {
    const testImagePath = `${process.cwd()}/tests/test_image.png`;
    return (
      request(app)
        .post('/photo')
        .field('altText', 'my new photo')
        // Doesn't seem to actually be attaching the image to the request... ?
        // Because relative file path was not working, and using buffer from fs.readFile was not working.
        // Although docs make it look like those should both work fine. Whatever.
        .attach('photo', testImagePath)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          // Check database directly with prisma client to see if the data is there.
          // Check that file has been uploaded to correct place.
        })
    );
  });

  it.skip('PUT /photo/:id updates an existing db entry', () => {});
});
