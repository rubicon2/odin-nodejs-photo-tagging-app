import app from '../../server/src/app.mjs';
import db from '../../server/src/db/client.mjs';
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

describe('/api/v1/check', () => {
  // Test validation is working correctly.
  it.each([
    {
      testType: 'missing photoId',
      photoId: '',
      posX: '0.25',
      posY: '0.75',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'PhotoId is a required field',
            path: 'photoId',
            type: 'field',
            value: '',
          },
          {
            location: 'body',
            msg: 'That photo does not exist',
            path: 'photoId',
            type: 'field',
            value: '',
          },
        ],
      },
    },
    {
      testType: 'invalid photoId',
      photoId: 'my-made-up-photo-id',
      posX: '0.25',
      posY: '0.75',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'That photo does not exist',
            path: 'photoId',
            type: 'field',
            value: 'my-made-up-photo-id',
          },
        ],
      },
    },
    {
      testType: 'missing posX',
      photoId: '1',
      posX: '',
      posY: '0.75',
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
      testType: 'missing posY',
      photoId: '1',
      posX: '0.25',
      posY: '',
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
      testType: 'non-number posX',
      photoId: '1',
      posX: 'my_bad_pos',
      posY: '0.75',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'Position X should be a number',
            path: 'posX',
            type: 'field',
            value: 'my_bad_pos',
          },
        ],
      },
    },
    {
      testType: 'non-number posY',
      photoId: '1',
      posX: '0.25',
      posY: 'my_bad_pos',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'Position Y should be a number',
            path: 'posY',
            type: 'field',
            value: 'my_bad_pos',
          },
        ],
      },
    },
  ])(
    'with a $testType, responds with status code 400 and a json message',
    async ({ photoId, posX, posY, expectedValidationObj }) => {
      await postTestData();
      const response = await request(app)
        .post(`/api/v1/check-tag`)
        .send(`photoId=${photoId}&posX=${posX}&posY=${posY}`);

      expect(response.statusCode).toStrictEqual(400);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          validation: expectedValidationObj,
        },
      });
    },
  );

  it.each([
    {
      testType: 'too far below posX and posY',
      // For these tests, these pos vars contain the deviation from the center, not the absolute position.
      // Makes it easier to read and compare to the tolerance value of 0.1.
      posX: -0.11,
      posY: -0.11,
      expectedNames: [],
    },
    {
      testType: 'too far above posX and posY',
      posX: 0.11,
      posY: 0.11,
      expectedNames: [],
    },
    {
      testType: 'too far below posX, dead on posY',
      posX: -0.11,
      posY: 0,
      expectedNames: [],
    },
    {
      testType: 'too far above posX, dead on posY',
      posX: 0.11,
      posY: 0,
      expectedNames: [],
    },
    {
      testType: 'dead on posX, too far below posY',
      posX: 0,
      posY: -0.11,
      expectedNames: [],
    },
    {
      testType: 'dead on posX, too far above posY',
      posX: 0.5,
      posY: 0.11,
      expectedNames: [],
    },
    {
      testType: 'dead on posX and posY',
      posX: 0,
      posY: 0,
      expectedNames: ['Jasmine'],
    },
    {
      testType: 'at min posX, dead on posY',
      posX: -0.1,
      posY: 0,
      expectedNames: ['Jasmine'],
    },
    {
      testType: 'at max posX, dead on posY',
      posX: 0.1,
      posY: 0,
      expectedNames: ['Jasmine'],
    },
    {
      testType: 'dead on posX, at min posY',
      posX: 0,
      posY: -0.1,
      expectedNames: ['Jasmine'],
    },
    {
      testType: 'dead on posX, at max posY',
      posX: 0,
      posY: 0.1,
      expectedNames: ['Jasmine'],
    },
  ])(
    'with $testType, return tag within 0.1 of that position (the specific tolerance may need to be adjusted)',
    async ({ posX, posY, expectedNames }) => {
      // Post our own photo and tags, so we can compare to those within the test and easily see what we are comparing to.
      const photo = await db.image.create({
        data: {
          altText: 'my alt text',
          url: 'my-url.jpg',
        },
      });

      const center = 0.5;

      await db.imageTag.createMany({
        data: [
          { imageId: photo.id, name: 'Jasmine', posX: center, posY: center },
        ],
      });

      const response = await request(app)
        .post('/api/v1/check-tag')
        .send(
          `photoId=${photo.id}&posX=${center + posX}&posY=${center + posY}`,
        );
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.status).toStrictEqual('success');
      expect(response.body.data.tags.map((tag) => tag.name)).toStrictEqual(
        expectedNames,
      );
    },
  );

  it.each([
    {
      testType: 'center',
      posX: 0.5,
      posY: 0.5,
      expectedNames: ['Jasmine'],
    },
    {
      testType: 'center left',
      posX: 0.4,
      posY: 0.5,
      expectedNames: ['Jasmine', 'Emma'],
    },
    {
      testType: 'far left',
      posX: 0.3,
      posY: 0.5,
      expectedNames: ['Emma'],
    },
    {
      testType: 'too far left',
      posX: 0.2,
      posY: 0.5,
      expectedNames: [],
    },
    {
      testType: 'center right',
      posX: 0.6,
      posY: 0.5,
      expectedNames: ['Jasmine', 'Meg'],
    },
    {
      testType: 'far right',
      posX: 0.7,
      posY: 0.5,
      expectedNames: ['Meg'],
    },
    {
      testType: 'too far right',
      posX: 0.8,
      posY: 0.5,
      expectedNames: [],
    },
  ])(
    'with $testType, return multiple tags within 0.1 of that position',
    async ({ posX, posY, expectedNames }) => {
      const photo = await db.image.create({
        data: {
          altText: 'my alt text',
          url: 'my-url.jpg',
        },
      });

      const center = 0.5;
      const spacing = 0.15;

      await db.imageTag.createMany({
        data: [
          { imageId: photo.id, name: 'Jasmine', posX: center, posY: center },
          {
            imageId: photo.id,
            name: 'Emma',
            posX: center - spacing,
            posY: center,
          },
          {
            imageId: photo.id,
            name: 'Meg',
            posX: center + spacing,
            posY: center,
          },
        ],
      });

      const response = await request(app)
        .post('/api/v1/check-tag')
        .send(`photoId=${photo.id}&posX=${posX}&posY=${posY}`);
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.status).toStrictEqual('success');
      expect(response.body.data.tags.map((tag) => tag.name)).toStrictEqual(
        expectedNames,
      );
    },
  );
});
