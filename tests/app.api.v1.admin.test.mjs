import app from '../server/src/app.mjs';
import db from '../server/src/db/client.mjs';
import {
  testImagePath,
  testImageData,
  postTestData,
  testImageDataAbsoluteUrl,
  testImageDataAbsoluteUrlWithTags,
  createTailRegExp,
} from './helpers/helpers.mjs';

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';

beforeEach(() => {
  process.env.ADMIN_ENABLED = 'true';
});

describe('/api/v1/admin', () => {
  it('responds with a 403 status code if admin mode is not enabled', async () => {
    process.env.ADMIN_ENABLED = 'false';
    await request(app).get('/api/v1/admin').expect(403);
    await request(app).post('/api/v1/admin').expect(403);
    await request(app).put('/api/v1/admin').expect(403);
    await request(app).delete('/api/v1/admin').expect(403);
  });

  describe('/photo', () => {
    describe('GET', () => {
      it('responds with a status code 200', () => {
        return request(app).get('/api/v1/admin/photo').expect(200);
      });

      it('returns all photo entries on the db, with absolute urls and tags', async () => {
        // Setup environment, add data, etc.
        await postTestData();
        // Must return (or await) async request otherwise tests won't run properly! Will get incorrectly passing tests.
        return request(app)
          .get('/api/v1/admin/photo')
          .expect('Content-Type', /json/)
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
    });

    describe('POST', () => {
      describe('with no altText or photo present on request', () => {
        it('returns a status code 400', () => {
          return request(app).post('/api/v1/admin/photo').expect(400);
        });

        it('returns json with validation messages', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .expect({
              status: 'fail',
              data: {
                validation: {
                  photo: 'Photo is a required field',
                  altText: 'Alt text is a required field',
                },
              },
            });
        });
      });

      describe('with blank altText present on request', () => {
        it('returns a status code 400', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .field('altText', '')
            .attach('photo', testImagePath)
            .expect(400);
        });

        it('returns json with validation messages', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .attach('photo', testImagePath)
            .expect({
              status: 'fail',
              data: {
                validation: {
                  altText: 'Alt text is a required field',
                },
              },
            });
        });
      });

      describe('with only altText present on request', () => {
        it('returns a status code 400', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .field('altText', '')
            .expect(400);
        });

        it('returns json with validation messages', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .field('altText', 'my new photo')
            .expect({
              status: 'fail',
              data: {
                validation: {
                  photo: 'Photo is a required field',
                },
              },
            });
        });
      });

      describe('with only photo present on request', () => {
        it('returns a status code 400', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .attach('photo', testImagePath)
            .expect(400);
        });

        it('returns json with validation messages', () => {
          return request(app)
            .post('/api/v1/admin/photo')
            .attach('photo', testImagePath)
            .expect({
              status: 'fail',
              data: {
                validation: {
                  altText: 'Alt text is a required field',
                },
              },
            });
        });
      });

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
          expect(originalFile.equals(getPhotoRes.body)).toEqual(true);
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

    describe('/:id', () => {
      it('responds with a 404 status code if there is no entry for the id', async () => {
        await request(app).get('/api/v1/admin/photo/my-made-up-id').expect(404);
        await request(app)
          .post('/api/v1/admin/photo/my-made-up-id')
          .expect(404);
        await request(app).put('/api/v1/admin/photo/my-made-up-id').expect(404);
        await request(app)
          .delete('/api/v1/admin/photo/my-made-up-id')
          .expect(404);
      });

      describe('GET', () => {
        describe('with a valid id', () => {
          it('responds with a status code 200', async () => {
            await postTestData();
            return request(app)
              .get(
                `/api/v1/admin/photo/${testImageDataAbsoluteUrlWithTags[0].id}`,
              )
              .expect(200);
          });

          it('returns db entry for matching photo id, with absolute url and tags', async () => {
            await postTestData();
            return request(app)
              .get(
                `/api/v1/admin/photo/${testImageDataAbsoluteUrlWithTags[0].id}`,
              )
              .expect('Content-Type', /json/)
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
        });

        describe('with an invalid id', () => {
          it('responds with a json message', () => {
            return request(app)
              .get('/api/v1/admin/photo/my-made-up-id')
              .expect({
                status: 'fail',
                data: {
                  message: 'That photo does not exist.',
                },
              });
          });
        });
      });

      describe('PUT', () => {
        describe('with a valid id', () => {
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

          it("updates an existing db entry's url correctly", async () => {
            await postTestData();
            const image = testImageData[0];
            const putRes = await request(app)
              .put(`/api/v1/admin/photo/${image.id}`)
              .field('url', 'my-updated-url.png');
            expect(putRes.statusCode).toStrictEqual(200);

            // Check the db has been updated with the details on the put request.
            const dbEntry = await db.image.findUnique({
              where: {
                id: image.id,
              },
            });

            expect(dbEntry.altText).toStrictEqual(testImageData[0].altText);
            expect('my-updated-url.png').toMatch(dbEntry.url);
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
  });
});
