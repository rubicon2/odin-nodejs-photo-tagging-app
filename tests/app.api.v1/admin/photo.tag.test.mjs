import app from '../../../server/src/app.mjs';
import db from '../../../server/src/db/client.mjs';
import {
  testImagePath,
  testImageData,
  postTestData,
  testImageDataAbsoluteUrl,
  testImageDataAbsoluteUrlWithTags,
  createTailRegExp,
  testImageTagData,
} from '../../helpers/helpers.mjs';

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';

beforeEach(() => {
  process.env.ADMIN_ENABLED = 'true';
});

describe('/api/v1/admin/photo/:photoId/tag', () => {
  describe('GET', () => {
    describe('with a valid photoId', () => {
      it('responds with a status code 200', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrlWithTags[0];
        return request(app)
          .get(`/api/v1/admin/photo/${testImage.id}/tag`)
          .expect(200);
      });

      it('responds with the tags for the photo id', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrlWithTags[0];
        return request(app)
          .get(`/api/v1/admin/photo/${testImage.id}/tag`)
          .expect({
            status: 'success',
            data: {
              tags: testImage.tags,
            },
          });
      });
    });

    describe('with an invalid photoId', () => {
      it('responds with a status code 404', async () => {
        return request(app)
          .get(`/api/v1/admin/photo/my-made-up-id/tag`)
          .expect(404);
      });

      it('responds with a json message', async () => {
        return request(app)
          .get(`/api/v1/admin/photo/my-made-up-id/tag`)
          .expect({
            status: 'fail',
            data: {
              message: 'That photo does not exist.',
            },
          });
      });
    });
  });

  describe('POST', () => {
    describe('with an invalid photoId', () => {
      it('responds with a status code 404 and a json message', async () => {
        const response = await request(app).post(
          '/api/v1/admin/photo/my-made-up-id/tag',
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

    describe('with a valid photoId', () => {
      it.each([
        {
          testType: 'no posX',
          sendString: 'posY=0.75&name=Jennifer',
          expectedValidationObj: {
            errors: [
              {
                location: 'body',
                msg: 'Position X is a required field',
                path: 'posX',
                type: 'field',
                value: '',
              },
              {
                location: 'body',
                msg: 'Position X should be a number',
                path: 'posX',
                type: 'field',
                value: '',
              },
            ],
          },
        },
        {
          testType: 'invalid posX',
          sendString: 'posX=some_string&posY=0.75&name=Jennifer',
          expectedValidationObj: {
            errors: [
              {
                location: 'body',
                msg: 'Position X should be a number',
                path: 'posX',
                type: 'field',
                value: 'some_string',
              },
            ],
          },
        },
        {
          testType: 'no posY',
          sendString: 'posX=0.25&name=Jennifer',
          expectedValidationObj: {
            errors: [
              {
                location: 'body',
                msg: 'Position Y is a required field',
                path: 'posY',
                type: 'field',
                value: '',
              },
              {
                location: 'body',
                msg: 'Position Y should be a number',
                path: 'posY',
                type: 'field',
                value: '',
              },
            ],
          },
        },
        {
          testType: 'invalid posX',
          sendString: 'posX=0.25&posY=some_string&name=Jennifer',
          expectedValidationObj: {
            errors: [
              {
                location: 'body',
                msg: 'Position Y should be a number',
                path: 'posY',
                type: 'field',
                value: 'some_string',
              },
            ],
          },
        },
        {
          testType: 'no name',
          sendString: 'posX=0.25&posY=0.75',
          expectedValidationObj: {
            errors: [
              {
                location: 'body',
                msg: 'Name is a required field',
                path: 'name',
                type: 'field',
                value: '',
              },
              {
                location: 'body',
                msg: 'Name should contain alphanumeric characters only',
                path: 'name',
                type: 'field',
                value: '',
              },
            ],
          },
        },
        {
          testType: 'invalid name',
          sendString: 'posX=0.25&posY=0.75&name=j@m',
          expectedValidationObj: {
            errors: [
              {
                location: 'body',
                msg: 'Name should contain alphanumeric characters only',
                path: 'name',
                type: 'field',
                value: 'j@m',
              },
            ],
          },
        },
      ])(
        'when provided with $testType, responds with a status code 400 and validation errors',
        async ({ sendString, expectedValidationObj }) => {
          await postTestData();
          const testImage = testImageDataAbsoluteUrl[0];
          const response = await request(app)
            .post(`/api/v1/admin/photo/${testImage.id}/tag`)
            .send(sendString);
          expect(response.statusCode).toStrictEqual(400);
          expect(response.body).toStrictEqual({
            status: 'fail',
            data: {
              validation: expectedValidationObj,
            },
          });
        },
      );

      describe('when provided the correct parameters: posX, posY, name', () => {
        it('responds with a status code 200', async () => {
          await postTestData();
          const testImage = testImageDataAbsoluteUrl[0];
          const response = await request(app)
            .post(`/api/v1/admin/photo/${testImage.id}/tag`)
            .send('posX=0.25&posY=0.75&name=Jennifer');
          expect(response.statusCode).toStrictEqual(200);
        });

        it('creates a new db entry and returns it in the response body', async () => {
          await postTestData();
          const testImage = testImageDataAbsoluteUrl[0];
          const postRes = await request(app)
            .post(`/api/v1/admin/photo/${testImage.id}/tag`)
            .send('posX=0.25&posY=0.75&name=Jennifer');
          // Check directly against database.
          const dbEntry = await db.imageTag.findUnique({
            where: {
              id: postRes.body.data.tag.id,
            },
          });
          // Make sure it has the correct data.
          expect(dbEntry).toMatchObject({
            posX: 0.25,
            posY: 0.75,
            name: 'Jennifer',
          });
          // Make sure the db entry matches what was returned by the post response.
          expect(postRes.body).toStrictEqual({
            status: 'success',
            data: {
              message: 'Tag successfully created.',
              tag: dbEntry,
            },
          });
        });
      });
    });
  });
});

describe('/api/v1/admin/photo/:photoId/tag/:tagId', () => {
  describe('GET', () => {
    describe('with a valid photoId and valid tagId', () => {
      it('responds with a status code 200', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrlWithTags[0];
        const testTag = testImageTagData[0];
        return request(app)
          .get(`/api/v1/admin/photo/${testImage.id}/tag/${testTag.id}`)
          .expect(200);
      });

      it('responds with the tag', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrlWithTags[0];
        const testTag = testImageTagData[0];
        return request(app)
          .get(`/api/v1/admin/photo/${testImage.id}/tag/${testTag.id}`)
          .expect({
            status: 'success',
            data: {
              tag: testTag,
            },
          });
      });
    });

    describe('with a valid photoId and invalid tagId', () => {
      it('responds with a status code 404', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrlWithTags[0];
        return request(app)
          .get(`/api/v1/admin/photo/${testImage.id}/tag/my-made-up-tag-id`)
          .expect(404);
      });

      it('responds with a json message', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrlWithTags[0];
        return request(app)
          .get(`/api/v1/admin/photo/${testImage.id}/tag/my-made-up-tag-id`)
          .expect({
            status: 'fail',
            data: {
              message: 'That tag does not exist.',
            },
          });
      });
    });

    describe('with an invalid photoId and a valid tagId', () => {
      it('responds with a status code 404', async () => {
        await postTestData();
        const testTag = testImageTagData[0];
        return request(app)
          .get(`/api/v1/admin/photo/my-made-up-photo-id/tag/${testTag.id}`)
          .expect(404);
      });

      it('responds with a json message', async () => {
        await postTestData();
        const testTag = testImageTagData[0];
        return request(app)
          .get(`/api/v1/admin/photo/my-made-up-photo-id/tag/${testTag.id}`)
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
