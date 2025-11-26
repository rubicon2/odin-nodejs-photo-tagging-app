import app from '../../../server/src/app.mjs';
import db from '../../../server/src/db/client.mjs';
import {
  testImagePath,
  testImage2Path,
  testImageData,
  postTestData,
  testImageDataAbsoluteUrl,
  testImageDataAbsoluteUrlWithTags,
} from '../../helpers/helpers.mjs';

import { describe, it, expect, beforeEach } from 'vitest';
import { request } from 'sagetest';
import fs from 'node:fs/promises';

beforeEach(() => {
  process.env.ADMIN_ENABLED = 'true';
});

describe('/api/v1/admin/photo', () => {
  describe('GET', () => {
    it('responds with a status code 200 and all db entries, with absolute urls and tags', async () => {
      await postTestData();
      const response = await request(app).get('/api/v1/admin/photo');

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'All photos with tags successfully retrieved.',
          photos: testImageDataAbsoluteUrlWithTags,
        },
      });
    });
  });

  describe('POST', () => {
    it.each([
      {
        testType: 'no altText or photo',
        altTextValue: '',
        photoValue: '',
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'Photo is a required field',
              path: 'photo',
              type: 'field',
              value: '',
            },
            {
              location: 'body',
              msg: 'AltText is a required field',
              path: 'altText',
              type: 'field',
              value: '',
            },
          ],
        },
      },
      {
        testType: 'no altText',
        altTextValue: '',
        photoValue: testImagePath,
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'AltText is a required field',
              path: 'altText',
              type: 'field',
              value: '',
            },
          ],
        },
      },
      {
        testType: 'no photo',
        altTextValue: 'my alt text',
        photoValue: '',
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'Photo is a required field',
              path: 'photo',
              type: 'field',
              value: '',
            },
          ],
        },
      },
    ])(
      'when provided with $testType, responds with a status code 400 and validation errors',
      async ({ altTextValue, photoValue, expectedValidationObj }) => {
        let response;

        // Supertest was ok with attaching a photoValue of '', but sagetest throws
        // an error because there is no file to access. Have to split it like this.
        if (photoValue) {
          response = await request(app)
            .post('/api/v1/admin/photo')
            .field('altText', altTextValue)
            .attach('photo', photoValue);
        } else {
          response = await request(app)
            .post('/api/v1/admin/photo')
            .field('altText', altTextValue);
        }

        expect(response.statusCode).toStrictEqual(400);
        expect(response.body).toStrictEqual({
          status: 'fail',
          data: {
            validation: expectedValidationObj,
          },
        });
      },
    );

    describe('with altText and photo present on request', () => {
      it('creates a new db entry and returns it in the response body', () => {
        return (
          request(app)
            .post('/api/v1/admin/photo')
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
          .post('/api/v1/admin/photo')
          .field('altText', 'my new photo')
          .attach('photo', testImagePath);

        expect(postRes.headers['content-type']).toMatch(/json/);
        expect(postRes.statusCode).toStrictEqual(200);

        // Photo should contain a url that we can use to get the photo file.
        const photo = postRes.body.data.photo;
        // Don't test if the file exists on the server - that is an implementation detail - just test that we can get it.
        const getPhotoRes = await request(app).get(photo.url);
        expect(getPhotoRes.statusCode).toStrictEqual(200);

        // To compare binary files, use equals method on buffer.
        // It seems that none of the matchers work with binary files.
        const originalFile = await fs.readFile(testImagePath);
        expect(originalFile.equals(getPhotoRes.body)).toStrictEqual(true);
      });

      it('can upload the same file with the same name twice without issues', async () => {
        const postResA = await request(app)
          .post('/api/v1/admin/photo')
          .field('altText', 'my new photo')
          .attach('photo', testImagePath);
        const postResB = await request(app)
          .post('/api/v1/admin/photo')
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
  });
});

describe('api/v1/admin/photo/:photoId', () => {
  it('responds with a 404 status code if there is no entry for the id', async () => {
    await request(app).get('/api/v1/admin/photo/my-made-up-id').expect(404);
    await request(app).post('/api/v1/admin/photo/my-made-up-id').expect(404);
    await request(app).put('/api/v1/admin/photo/my-made-up-id').expect(404);
    await request(app).delete('/api/v1/admin/photo/my-made-up-id').expect(404);
  });

  describe('GET', () => {
    it('with a valid id, responds with status code 200 and the db entry, with absolute url and tags', async () => {
      await postTestData();
      const response = await request(app).get(
        `/api/v1/admin/photo/${testImageDataAbsoluteUrlWithTags[0].id}`,
      );

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Photo with tags successfully retrieved.',
          photo: testImageDataAbsoluteUrlWithTags[0],
        },
      });
    });

    it('with an invalid id, responds with status code 404 and a json message', async () => {
      const response = await request(app).get(
        '/api/v1/admin/photo/my-made-up-id',
      );

      expect(response.statusCode).toStrictEqual(404);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    });
  });

  describe('PUT', () => {
    describe('with a valid id', () => {
      it('without an altText or photo, respond with status code 400 and a json message', async () => {
        await postTestData();
        const image = testImageData[0];
        const putRes = await request(app).put(
          `/api/v1/admin/photo/${image.id}`,
        );
        expect(putRes.statusCode).toStrictEqual(400);
        expect(putRes.body).toStrictEqual({
          status: 'fail',
          data: {
            message:
              'No altText or photo have been provided, so no updates have been made.',
          },
        });
      });

      it("updates an existing db entry's altText correctly", async () => {
        await postTestData();
        const image = testImageData[0];
        const putRes = await request(app)
          .put(`/api/v1/admin/photo/${image.id}`)
          .field('altText', 'my updated alt text');
        expect(putRes.statusCode).toStrictEqual(200);

        // Check the db has been updated with the details on the put request.
        const dbEntry = await db.image.findUnique({
          where: {
            id: image.id,
          },
        });

        expect(dbEntry.altText).toStrictEqual('my updated alt text');
        expect(testImageDataAbsoluteUrl[0].url).toMatch(dbEntry.url);
      });

      it("updates an existing db entry's image correctly, deletes the original file and uploads the new file", async () => {
        await postTestData();
        const image = testImageData[0];

        // Need to get image url from API since test data doesn't include volume name.
        let getRes = await request(app).get(`/api/v1/admin/photo/${image.id}`);

        // Check original image upload exists.
        const originalUploadUrl = getRes.body.data.photo.url;
        getRes = await request(app).get(originalUploadUrl);
        const originalFile = await fs.readFile(testImagePath);
        expect(originalFile.equals(getRes.body)).toStrictEqual(true);

        const putRes = await request(app)
          .put(`/api/v1/admin/photo/${image.id}`)
          .attach('photo', testImage2Path);
        expect(putRes.statusCode).toStrictEqual(200);

        // Check original image upload has been deleted and is no longer accessible.
        getRes = await request(app).get(originalUploadUrl);
        expect(getRes.statusCode).toStrictEqual(404);

        // Check that the file exists at the location returned by the put request.
        const newUploadUrl = putRes.body.data.photo.url;
        getRes = await request(app).get(newUploadUrl);
        expect(getRes.statusCode).toStrictEqual(200);

        // Check that the file has been updated to the new test image (which is different from the original).
        const newUploadFile = await fs.readFile(testImage2Path);
        expect(newUploadFile.equals(getRes.body)).toStrictEqual(true);
      });
    });

    describe('with an invalid id', () => {
      it('responds with a json message', () => {
        return request(app)
          .put('/api/v1/admin/photo/my-made-up-id')
          .expect({
            status: 'fail',
            data: {
              message: 'That photo does not exist.',
            },
          });
      });
    });
  });

  describe('DELETE', () => {
    describe('with a valid id', () => {
      const testImage = testImageDataAbsoluteUrl[0];

      it('responds with a status code 200', async () => {
        await postTestData();
        const response = await request(app).delete(
          `/api/v1/admin/photo/${testImage.id}`,
        );
        expect(response.statusCode).toStrictEqual(200);
      });

      it('responds with a json message', async () => {
        await postTestData();
        const response = await request(app).delete(
          `/api/v1/admin/photo/${testImage.id}`,
        );
        expect(response.body).toStrictEqual({
          status: 'success',
          data: {
            message: 'Photo successfully deleted.',
            photo: testImage,
          },
        });
      });

      it('removes the corresponding db entry', async () => {
        await postTestData();
        await request(app).delete(`/api/v1/admin/photo/${testImage.id}`);
        const dbEntry = await db.image.findUnique({
          where: {
            id: testImage.id,
          },
        });
        expect(dbEntry).toBeNull();
        // Check that the other entries are unaffected.
        const allEntries = await db.image.findMany();
        expect(allEntries).toStrictEqual(
          testImageData.filter((image) => image.id !== testImage.id),
        );
      });

      it('removes the corresponding file on the server', async () => {
        await postTestData();
        await request(app).delete(`/api/v1/admin/photo/${testImage.id}`);
        // Don't test if the file exists on the server - that is an implementation detail - just test that we can't get it.
        await request(app).get(`${testImage.url}`).expect(404);
        // Check all other files are unaffected.
        for (const image of testImageDataAbsoluteUrl) {
          // Skip the one we just deleted.
          if (image.id === testImage.id) continue;
          await request(app).get(`${image.url}`).expect(200);
        }
      });
    });

    describe('with an invalid id', () => {
      it('responds with a json message', async () => {
        await postTestData();
        return request(app)
          .delete('/api/v1/admin/photo/my-made-up-id')
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
