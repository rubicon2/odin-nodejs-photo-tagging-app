import app from '../../../server/src/app.mjs';
import db from '../../../server/src/db/client.mjs';
import {
  postTestData,
  testImageDataAbsoluteUrl,
  testImageDataAbsoluteUrlWithTags,
  testImageTagData,
} from '../../helpers/helpers.mjs';

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

beforeEach(() => {
  process.env.ADMIN_ENABLED = 'true';
});

describe('/api/v1/admin/photo/:photoId/tag', () => {
  it('with an invalid photoId, responds with a status code 404 and json message', async () => {
    const expectedJson = {
      status: 'fail',
      data: {
        message: 'That photo does not exist.',
      },
    };

    await request(app)
      .get(`/api/v1/admin/photo/my-made-up-id/tag`)
      .expect(404)
      .expect(expectedJson);
    await request(app)
      .post(`/api/v1/admin/photo/my-made-up-id/tag`)
      .expect(404)
      .expect(expectedJson);
  });

  describe('GET', () => {
    it('with a valid photoId, responds with a status code 200 and tags', async () => {
      await postTestData();
      const testImage = testImageDataAbsoluteUrlWithTags[0];
      const response = await request(app).get(
        `/api/v1/admin/photo/${testImage.id}/tag`,
      );

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          tags: testImage.tags,
        },
      });
    });
  });

  describe('POST', () => {
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

      it('with the correct parameters, responds with a status code 200, creates a new tag and returns it in the response body', async () => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrl[0];
        const postRes = await request(app)
          .post(`/api/v1/admin/photo/${testImage.id}/tag`)
          .send('posX=0.25&posY=0.75&name=Jennifer');
        expect(postRes.statusCode).toStrictEqual(200);

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

describe('/api/v1/admin/photo/:photoId/tag/:tagId', () => {
  describe('GET', () => {
    it('with a valid photoId and valid tagId, responds with status code 200 and tag', async () => {
      await postTestData();
      const testImage = testImageDataAbsoluteUrlWithTags[0];
      const testTag = testImageTagData[0];
      const response = await request(app).get(
        `/api/v1/admin/photo/${testImage.id}/tag/${testTag.id}`,
      );

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          tag: testTag,
        },
      });
    });

    it.each([
      {
        testType: 'valid photoId and invalid tagId',
        photoId: testImageDataAbsoluteUrlWithTags[0].id,
        tagId: 'my-made-up-tag-id',
        message: 'That tag does not exist.',
      },
      {
        testType: 'invalid photoId and valid tagId',
        photoId: 'my-made-up-photo-id',
        tagId: testImageTagData[0].id,
        message: 'That photo does not exist.',
      },
    ])(
      'with a $testType, respond with status code 404 and json message',
      async ({ photoId, tagId, message }) => {
        await postTestData();
        const response = await request(app).get(
          `/api/v1/admin/photo/${photoId}/tag/${tagId}`,
        );
        expect(response.statusCode).toStrictEqual(404);
        expect(response.body).toStrictEqual({
          status: 'fail',
          data: {
            message,
          },
        });
      },
    );
  });
});
