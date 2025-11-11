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
    await request(app)
      .put(`/api/v1/admin/photo/my-made-up-id/tag`)
      .expect(404)
      .expect(expectedJson);
    await request(app)
      .delete(`/api/v1/admin/photo/my-made-up-id/tag`)
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
                msg: 'posX is a required field',
                path: 'posX',
                type: 'field',
                value: '',
              },
              {
                location: 'body',
                msg: 'posX should be a number',
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
                msg: 'posX should be a number',
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
                msg: 'posY is a required field',
                path: 'posY',
                type: 'field',
                value: '',
              },
              {
                location: 'body',
                msg: 'posY should be a number',
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
                msg: 'posY should be a number',
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
                msg: 'name is a required field',
                path: 'name',
                type: 'field',
                value: '',
              },
              {
                location: 'body',
                msg: 'name should contain alphanumeric characters only',
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
                msg: 'name should contain alphanumeric characters only',
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

  describe('PUT', () => {
    describe('with a valid photoId', () => {
      describe('validation', () => {
        // Split test data into arrays as there are a lot of tests for the validation on this.
        // Check the create, update and delete fields on the body are arrays.
        const fieldsAreArraysTests = [
          {
            testType: 'create field not an array',
            sendObj: {
              create: {},
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'create field is not an array',
                  path: 'create',
                  type: 'field',
                  value: {},
                },
              ],
            },
          },
          {
            testType: 'update field not an array',
            sendObj: {
              update: {},
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'update field is not an array',
                  path: 'update',
                  type: 'field',
                  value: {},
                },
              ],
            },
          },
          {
            testType: 'delete field not an array',
            sendObj: {
              delete: {},
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'delete field is not an array',
                  path: 'delete',
                  type: 'field',
                  value: {},
                },
              ],
            },
          },
        ];

        const createArrayValidationTests = [
          {
            testType:
              'create[*][name], create[*][posX] or create[*][posY] missing',
            sendObj: {
              create: [
                {
                  name: '',
                  posX: 1,
                  posY: 1,
                },
                {
                  name: 'Jimmy',
                  posX: '',
                  posY: 1,
                },
                {
                  name: 'Jimmy',
                  posX: 1,
                  posY: '',
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'create.*.name is a required field',
                  path: 'create[0].name',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'create.*.name should contain alphanumeric characters only',
                  path: 'create[0].name',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'create.*.posX is a required field',
                  path: 'create[1].posX',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'create.*.posX should be a number',
                  path: 'create[1].posX',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'create.*.posY is a required field',
                  path: 'create[2].posY',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'create.*.posY should be a number',
                  path: 'create[2].posY',
                  type: 'field',
                  value: '',
                },
              ],
            },
          },
          {
            testType: 'create[*][posX] or create[*][posY] not numbers',
            sendObj: {
              create: [
                {
                  name: 'Jimmy',
                  posX: 'Jimbo',
                  posY: '0',
                },
                {
                  name: 'Jimmy',
                  posX: '0',
                  posY: 'Jimbo',
                },
              ],
              update: [],
              delete: [],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'create.*.posX should be a number',
                  path: 'create[0].posX',
                  type: 'field',
                  value: 'Jimbo',
                },
                {
                  location: 'body',
                  msg: 'create.*.posY should be a number',
                  path: 'create[1].posY',
                  type: 'field',
                  value: 'Jimbo',
                },
              ],
            },
          },
        ];

        const updateArrayValidationTests = [
          {
            testType: 'update[*][id] missing',
            sendObj: {
              update: [
                {
                  id: '',
                  name: 'Jimmy',
                  posX: 1,
                  posY: 1,
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'update.*.id is a required field',
                  path: 'update[0].id',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'Tag with id:  does not exist',
                  path: 'update[0].id',
                  type: 'field',
                  value: '',
                },
              ],
            },
          },
          {
            testType: 'update[*][id] does not exist on database',
            sendObj: {
              update: [
                {
                  id: 'my-incorrect-id',
                  name: 'Jimmy',
                  posX: 1,
                  posY: 1,
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'Tag with id: my-incorrect-id does not exist',
                  path: 'update[0].id',
                  type: 'field',
                  value: 'my-incorrect-id',
                },
              ],
            },
          },
          {
            testType: 'optional update[*][name] should not be empty',
            sendObj: {
              update: [
                {
                  id: 'some-long-string',
                  name: '',
                  posX: 1,
                  posY: 1,
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'update.*.name is a required field',
                  path: 'update[0].name',
                  type: 'field',
                  value: '',
                },
                {
                  location: 'body',
                  msg: 'update.*.name should contain alphanumeric characters only',
                  path: 'update[0].name',
                  type: 'field',
                  value: '',
                },
              ],
            },
          },
          {
            testType: 'optional update[*][posX] not a number',
            sendObj: {
              update: [
                {
                  id: 'some-long-string',
                  name: 'Jimmy',
                  posX: 'not-a-number',
                  posY: 1,
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'update.*.posX should be a number',
                  path: 'update[0].posX',
                  type: 'field',
                  value: 'not-a-number',
                },
              ],
            },
          },
          {
            testType: 'optional update[*][posY] not a number',
            sendObj: {
              update: [
                {
                  id: 'some-long-string',
                  name: 'Jimmy',
                  posX: 1,
                  posY: 'not-a-number',
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'update.*.posY should be a number',
                  path: 'update[0].posY',
                  type: 'field',
                  value: 'not-a-number',
                },
              ],
            },
          },
        ];

        const deleteArrayValidationTests = [
          {
            testType: 'update[*] does not exist on database',
            sendObj: {
              update: [
                {
                  id: 'my-incorrect-id',
                  name: 'Jimmy',
                  posX: 1,
                  posY: 1,
                },
              ],
            },
            expectedValidationObj: {
              errors: [
                {
                  location: 'body',
                  msg: 'Tag with id: my-incorrect-id does not exist',
                  path: 'update[0].id',
                  type: 'field',
                  value: 'my-incorrect-id',
                },
              ],
            },
          },
        ];

        it.each([
          ...fieldsAreArraysTests,
          ...createArrayValidationTests,
          ...updateArrayValidationTests,
          ...deleteArrayValidationTests,
        ])(
          'when provided with $testType, responds with status code 400 and validation errors',
          async ({ sendObj, expectedValidationObj }) => {
            await postTestData();
            const photo = testImageDataAbsoluteUrlWithTags[0];
            // Add a tag that we can update it with the id.
            await db.imageTag.create({
              data: {
                id: 'some-long-string',
                imageId: photo.id,
                name: 'Kim',
                posX: 0.5,
                posY: 0.5,
              },
            });
            const response = await request(app)
              .put(`/api/v1/admin/photo/${photo.id}/tag`)
              .send(sendObj);

            expect(response.statusCode).toStrictEqual(400);
            expect(response.body).toStrictEqual({
              status: 'fail',
              data: {
                validation: expectedValidationObj,
              },
            });
          },
        );
      });

      it('with a valid create field, create the relevant tags on the database, respond with status code 200 and return the tags', async () => {
        await postTestData();
        // Clear out the regular test data tags to keep the test consistent.
        await db.imageTag.deleteMany();

        const photo = testImageDataAbsoluteUrlWithTags[0];
        const response = await request(app)
          .put(`/api/v1/admin/photo/${photo.id}/tag`)
          .send({
            create: [
              {
                name: 'Jimmy',
                posX: 0.25,
                posY: 0.75,
              },
              {
                name: 'Kim',
                posX: 0.75,
                posY: 0.25,
              },
            ],
          });
        expect(response.statusCode).toStrictEqual(200);

        // Check directly against the database.
        const dbEntries = await db.imageTag.findMany({
          where: {
            imageId: photo.id,
          },
        });

        expect(dbEntries.length).toStrictEqual(2);

        expect(response.body).toStrictEqual({
          status: 'success',
          data: {
            message: 'Tags successfully updated.',
            created: dbEntries,
          },
        });
      });
    });
  });

  describe('DELETE', () => {
    it('deletes all tags for the photoId and returns status code 200 and json message', async () => {
      await postTestData();
      const photo = testImageDataAbsoluteUrlWithTags[0];
      const response = await request(app).delete(
        `/api/v1/admin/photo/${photo.id}/tag`,
      );
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: `Tags for photo ${photo.id} successfully deleted.`,
        },
      });

      // Check that there are no tags left on the db for this photo id.
      const dbEntries = await db.imageTag.findMany({
        where: {
          imageId: photo.id,
        },
      });

      expect(dbEntries).toStrictEqual([]);
    });
  });
});

describe('/api/v1/admin/photo/:photoId/tag/:tagId', () => {
  it.each([
    {
      testType: 'valid photoId and invalid tagId',
      method: 'get',
      photoId: testImageDataAbsoluteUrlWithTags[0].id,
      tagId: 'my-made-up-tag-id',
      message: 'That tag does not exist.',
    },
    {
      testType: 'invalid photoId and valid tagId',
      method: 'get',
      photoId: 'my-made-up-photo-id',
      tagId: testImageTagData[0].id,
      message: 'That photo does not exist.',
    },
    {
      testType: 'valid photoId and invalid tagId',
      method: 'put',
      photoId: testImageDataAbsoluteUrlWithTags[0].id,
      tagId: 'my-made-up-tag-id',
      message: 'That tag does not exist.',
    },
    {
      testType: 'invalid photoId and valid tagId',
      method: 'put',
      photoId: 'my-made-up-photo-id',
      tagId: testImageTagData[0].id,
      message: 'That photo does not exist.',
    },
    {
      testType: 'valid photoId and invalid tagId',
      method: 'delete',
      photoId: testImageDataAbsoluteUrlWithTags[0].id,
      tagId: 'my-made-up-tag-id',
      message: 'That tag does not exist.',
    },
    {
      testType: 'invalid photoId and valid tagId',
      method: 'delete',
      photoId: 'my-made-up-photo-id',
      tagId: testImageTagData[0].id,
      message: 'That photo does not exist.',
    },
  ])(
    '$method: with a $testType, respond with status code 404 and json message',
    async ({ method, photoId, tagId, message }) => {
      await postTestData();
      const response = await request(app)[method](
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
  });

  describe('PUT', () => {
    it('without a posX, posY, or name, respond with status code 400 and a json message', async () => {
      await postTestData();
      const tag = testImageTagData[0];
      const putRes = await request(app).put(
        `/api/v1/admin/photo/${tag.imageId}/tag/${tag.id}`,
      );
      expect(putRes.statusCode).toStrictEqual(400);
      expect(putRes.body).toStrictEqual({
        status: 'fail',
        data: {
          message:
            'No posX, posY, or name have been provided, so no updates have been made.',
        },
      });
    });

    it("updates an existing tag's posX correctly without affecting other fields, and responds with status code 200 and updated tag", async () => {
      await postTestData();
      const tag = testImageTagData[0];
      const putRes = await request(app)
        .put(`/api/v1/admin/photo/${tag.imageId}/tag/${tag.id}`)
        .send('posX=0.75');
      expect(putRes.statusCode).toStrictEqual(200);

      // Check against db directly instead of using GET route.
      const dbEntry = await db.imageTag.findUnique({
        where: {
          id: tag.id,
        },
      });

      expect(dbEntry).toStrictEqual({
        ...tag,
        posX: 0.75,
      });

      // Make sure response body matches updated dbEntry.
      expect(putRes.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Tag successfully updated.',
          tag: dbEntry,
        },
      });
    });

    it("updates an existing tag's posY correctly withput affecting other fields,  and responds with status code 200 and updated tag", async () => {
      await postTestData();
      const tag = testImageTagData[0];
      const putRes = await request(app)
        .put(`/api/v1/admin/photo/${tag.imageId}/tag/${tag.id}`)
        .send('posY=0.75');
      expect(putRes.statusCode).toStrictEqual(200);

      // Check against db directly instead of using GET route.
      const dbEntry = await db.imageTag.findUnique({
        where: {
          id: tag.id,
        },
      });

      expect(dbEntry).toStrictEqual({
        ...tag,
        posY: 0.75,
      });

      // Make sure response body matches updated dbEntry.
      expect(putRes.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Tag successfully updated.',
          tag: dbEntry,
        },
      });
    });

    it("updates an existing tag's name correctly withput affecting other fields,  and responds with status code 200 and updated tag", async () => {
      await postTestData();
      const tag = testImageTagData[0];
      const putRes = await request(app)
        .put(`/api/v1/admin/photo/${tag.imageId}/tag/${tag.id}`)
        .send('name=Jennifer');
      expect(putRes.statusCode).toStrictEqual(200);

      // Check against db directly instead of using GET route.
      const dbEntry = await db.imageTag.findUnique({
        where: {
          id: tag.id,
        },
      });

      expect(dbEntry).toStrictEqual({
        ...tag,
        name: 'Jennifer',
      });

      // Make sure response body matches updated dbEntry.
      expect(putRes.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Tag successfully updated.',
          tag: dbEntry,
        },
      });
    });

    it.each([
      {
        testType: 'invalid posX',
        sendString: 'posX=some_string&posY=0.75&name=Jennifer',
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'posX should be a number',
              path: 'posX',
              type: 'field',
              value: 'some_string',
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
              msg: 'posY should be a number',
              path: 'posY',
              type: 'field',
              value: 'some_string',
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
              msg: 'name should contain alphanumeric characters only',
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
        const tag = testImageTagData[0];
        const response = await request(app)
          .put(`/api/v1/admin/photo/${tag.imageId}/tag/${tag.id}`)
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
  });

  describe('DELETE', () => {
    it('with a valid photoId and tagId, deletes the tag and returns status code 200 and json message', async () => {
      await postTestData();
      const tag = testImageTagData[0];
      const response = await request(app).delete(
        `/api/v1/admin/photo/${tag.imageId}/tag/${tag.id}`,
      );
      expect(response.statusCode).toStrictEqual(200);

      // Check against database to make sure this tag is gone.
      const dbEntry = await db.imageTag.findUnique({
        where: {
          id: tag.id,
        },
      });

      expect(dbEntry).toBeNull();
    });
  });
});
