import admin from '../server/src/routers/api/v1/v1.admin.mjs';
import db from '../server/src/db/client.mjs';
import { RAILWAY_VOLUME_MOUNT_PATH } from '../server/src/env.mjs';
import {
  testImagePath,
  postTestData,
  testImageDataAbsoluteUrlWithTags,
} from './helpers/helpers.mjs';

import express from 'express';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';

const app = express();
app.use('/data', express.static(RAILWAY_VOLUME_MOUNT_PATH));
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

  describe('POST /photo', () => {
    it('creates a new db entry and returns it in the response body', async () => {
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
          .then(async (res) => {
            // Check database directly with prisma client to see if the data is there.
            const body = res.body;
            const photo = body.data.photo;
            const dbEntry = await db.image.findUnique({
              where: {
                id: photo.id,
              },
            });
            expect(dbEntry.altText).toStrictEqual('my new photo');
            expect(dbEntry.url).toMatch(/.?test_image.png/);
          })
      );
    });

    it('uploads a file to the location pointed to by the returned url', async () => {
      const postRes = await request(app)
        .post('/photo')
        .field('altText', 'my new photo')
        .attach('photo', testImagePath);

      expect(postRes.headers['content-type']).toMatch(/json/);
      expect(postRes.statusCode).toStrictEqual(200);

      // Photo should contain a url that we can use to get the photo file.
      const photo = postRes.body.data.photo;
      // Don't test if the file exists on the server - that is an implementation detail - just test that we can get it.
      const getPhotoRes = await request(app).get(photo.url);
      expect(getPhotoRes.statusCode).toStrictEqual(200);

      const originalFile = await fs.readFile(testImagePath);
      // To compare binary files, use equals method on buffer.
      // It seems that none of the matchers work with binary files.
      expect(originalFile.equals(getPhotoRes.body)).toEqual(true);
    });

    it('can upload the same file with the same name twice without issues', async () => {
      const postResA = await request(app)
        .post('/photo')
        .field('altText', 'my new photo')
        .attach('photo', testImagePath);
      const postResB = await request(app)
        .post('/photo')
        .field('altText', 'my new photo')
        .attach('photo', testImagePath);

      // Expect second request to have been successful.
      expect(postResB.statusCode).toStrictEqual(200);

      // Check the entries were made on the db as expected.
      const images = await db.image.findMany();
      expect(images.length).toStrictEqual(2);
      for (const image of images) {
        expect(image.altText).toStrictEqual('my new photo');
        expect(image.url).toMatch(/^.*test_image.png/);
      }
    });
  });

  it.skip('PUT /photo/:id updates an existing db entry', () => {});
});
