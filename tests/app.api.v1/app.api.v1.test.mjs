import app from '../../server/src/app.mjs';
import db from '../../server/src/db/client.mjs';
import {
  postTestData,
  testImageDataAbsoluteUrl,
  testImageTagData,
} from '../helpers/helpers.mjs';

import { describe, it, expect, vi } from 'vitest';
import { request } from 'sagetest';

describe('/api/v1/photo', () => {
  describe('GET', () => {
    it('responds with a status code 200 and a random db entry, with absolute img url, and only the id and name of tags', async () => {
      // Setup environment, add data, etc.
      await postTestData();
      const testImage = testImageDataAbsoluteUrl[0];
      // Remove all except the test db entry so we know what to expect.
      await db.image.deleteMany({
        where: {
          id: {
            not: testImage.id,
          },
        },
      });
      // Must return async request otherwise tests won't run properly! Will get incorrectly passing tests.
      const response = await request(app).get('/api/v1/photo');

      expect(response.statusCode).toStrictEqual(200);

      const tags = testImageTagData
        .filter((tag) => tag.imageId === testImage.id)
        .map(({ id, name }) => ({ id, name }));

      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          message: 'Photo successfully retrieved.',
          photo: {
            ...testImage,
            tagCount: tags.length,
            tags,
          },
        },
      });
    });

    it('does not respond with the same image twice', async () => {
      await postTestData();
      // Test a number of times, otherwise might just be lucky if we test only once and test passes.
      for (var i = 0; i < 50; i++) {
        const responseA = await request(app).get('/api/v1/photo');
        const cookie = responseA.headers['set-cookie'];
        const responseB = await request(app)
          .get('/api/v1/photo')
          .set('cookie', cookie);
        expect(responseA.body.data.photo).not.toStrictEqual(
          responseB.body.data.photo,
        );
      }
    });

    it('responds with a 404 and json message if there are no photos to retrieve', async () => {
      // Deciding to go with 404 status code due to the following from MDN:
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
      // "In an API, [a 404 status code] can also mean that the endpoint is valid but the resource itself does not exist."
      const response = await request(app).get('/api/v1/photo');
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          message: 'No photos were found.',
        },
      });
    });
  });
});

describe('/api/v1/check-tag', () => {
  // Test validation is working correctly.
  it.each([
    {
      testType: 'missing photoId',
      photoId: '',
      tagId: '1',
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
      tagId: '1',
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
      testType: 'missing tagId',
      photoId: '1',
      tagId: '',
      posX: '0.5',
      posY: '0.5',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'TagId is a required field',
            path: 'tagId',
            type: 'field',
            value: '',
          },
          {
            location: 'body',
            msg: 'That tag does not exist',
            path: 'tagId',
            type: 'field',
            value: '',
          },
        ],
      },
    },
    {
      testType: 'missing posX',
      photoId: '1',
      tagId: '1',
      posX: '',
      posY: '0.75',
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
      testType: 'missing posY',
      photoId: '1',
      tagId: '1',
      posX: '0.25',
      posY: '',
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
      testType: 'non-number posX',
      photoId: '1',
      tagId: '1',
      posX: 'my_bad_pos',
      posY: '0.75',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'posX should be a number',
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
      tagId: '1',
      posX: '0.25',
      posY: 'my_bad_pos',
      expectedValidationObj: {
        errors: [
          {
            location: 'body',
            msg: 'posY should be a number',
            path: 'posY',
            type: 'field',
            value: 'my_bad_pos',
          },
        ],
      },
    },
  ])(
    'with a $testType, responds with status code 400 and a json message',
    async ({ photoId, tagId, posX, posY, expectedValidationObj }) => {
      await postTestData();
      const response = await request(app).post(`/api/v1/check-tag`).send({
        photoId,
        tagId,
        posX,
        posY,
      });

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
      tagId: '1',
      expectedName: undefined,
    },
    {
      testType: 'too far above posX and posY',
      posX: 0.11,
      posY: 0.11,
      tagId: '1',
      expectedName: undefined,
    },
    {
      testType: 'too far below posX, dead on posY',
      posX: -0.11,
      posY: 0,
      tagId: '1',
      expectedName: undefined,
    },
    {
      testType: 'too far above posX, dead on posY',
      posX: 0.11,
      posY: 0,
      tagId: '1',
      expectedName: undefined,
    },
    {
      testType: 'dead on posX, too far below posY',
      posX: 0,
      posY: -0.11,
      tagId: '1',
      expectedName: undefined,
    },
    {
      testType: 'dead on posX, too far above posY',
      posX: 0.5,
      posY: 0.11,
      tagId: '1',
      expectedName: undefined,
    },
    {
      testType: 'dead on posX and posY',
      posX: 0,
      posY: 0,
      tagId: '1',
      expectedName: 'Jasmine',
    },
    {
      testType: 'at min posX, dead on posY',
      posX: -0.1,
      posY: 0,
      tagId: '1',
      expectedName: 'Jasmine',
    },
    {
      testType: 'at max posX, dead on posY',
      posX: 0.1,
      posY: 0,
      tagId: '1',
      expectedName: 'Jasmine',
    },
    {
      testType: 'dead on posX, at min posY',
      posX: 0,
      posY: -0.1,
      tagId: '1',
      expectedName: 'Jasmine',
    },
    {
      testType: 'dead on posX, at max posY',
      posX: 0,
      posY: 0.1,
      tagId: '1',
      expectedName: 'Jasmine',
    },
  ])(
    'with $testType, return tag within 0.1 of that position (the specific tolerance may need to be adjusted)',
    async ({ posX, posY, tagId, expectedName }) => {
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
          {
            id: '1',
            imageId: photo.id,
            name: 'Jasmine',
            posX: center,
            posY: center,
          },
        ],
      });

      const response = await request(app)
        .post('/api/v1/check-tag')
        .send({
          photoId: photo.id,
          tagId,
          posX: center + posX,
          posY: center + posY,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.status).toStrictEqual('success');
      expect(response.body.data.tag?.name).toStrictEqual(expectedName);
    },
  );

  it('return foundAllTags bool which is self-explanatory, and when true, the time it took to find all tags', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });

    await postTestData();
    const testImage = testImageDataAbsoluteUrl[0];

    // Clear out all images except the first, so when we use random image route we always get the same one.
    await db.image.deleteMany({
      where: {
        id: {
          not: testImage.id,
        },
      },
    });

    // Clear out all tags and replace with specific tags for this test.
    await db.imageTag.deleteMany();
    const testImageTags = await db.imageTag.createManyAndReturn({
      data: [
        {
          imageId: testImage.id,
          name: 'Avi',
          posX: 0.25,
          posY: 0.25,
        },
        {
          imageId: testImage.id,
          name: 'Shera',
          posX: 0.75,
          posY: 0.75,
        },
        {
          imageId: testImage.id,
          name: 'Yoshi',
          posX: 1,
          posY: 1,
        },
      ],
    });

    let response;

    // Get random image with route so startTime is recorded in session.
    // I am aware this is a bad test. Test the result, not the
    // implementation. But there is no other logical way to record the
    // time and test it in an isolated way... that I can think of, anyway.

    // With fake timers, this times out. Why?
    // It was because postgres uses a method called setImmediate.
    // I have never used it, but apparently it relates to timing,
    // and if it is mocked out by vitest, the db call will hang
    // since the setImmediate callback will never be invoked until
    // time advances. Since this is await, you'd have to remove that and
    // use .then instead, advance the time to make the callback trigger, b
    // before running the rest of the test.

    // The solution is to only mock Date with the useFakeTimers options object.
    response = await request(app).get('/api/v1/photo');
    expect(response.status).toStrictEqual(200);

    // Get cookie so we can use in future requests.
    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeDefined();

    response = await request(app)
      .post('/api/v1/check-tag')
      .set('cookie', cookie)
      .send({
        photoId: testImage.id,
        posX: 0.25,
        posY: 0.25,
        tagId: testImageTags.find((tag) => tag.name === 'Avi').id,
      });

    expect(response.body).toStrictEqual({
      status: 'success',
      data: {
        foundAllTags: false,
        tag: testImageTags.find((tag) => tag.name === 'Avi'),
      },
    });

    response = await request(app)
      .post('/api/v1/check-tag')
      .set('cookie', cookie)
      .send({
        photoId: testImage.id,
        posX: 0.75,
        posY: 0.75,
        tagId: testImageTags.find((tag) => tag.name === 'Shera').id,
      });

    expect(response.body).toStrictEqual({
      status: 'success',
      data: {
        foundAllTags: false,
        tag: testImageTags.find((tag) => tag.name === 'Shera'),
      },
    });

    // Advance timer so msToFinish can be checked.
    vi.advanceTimersByTime(10000);

    response = await request(app)
      .post('/api/v1/check-tag')
      .set('cookie', cookie)
      .send({
        photoId: testImage.id,
        posX: 1.0,
        posY: 1.0,
        tagId: testImageTags.find((tag) => tag.name === 'Yoshi').id,
      });

    expect(response.body).toStrictEqual({
      status: 'success',
      data: {
        foundAllTags: true,
        msToFinish: 10000,
        tag: testImageTags.find((tag) => tag.name === 'Yoshi'),
      },
    });
  });

  vi.useRealTimers();
});
