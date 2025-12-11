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

    it('resets found image tags upon loading a new image', async () => {
      // This is kind of a test of both routes really. Not sure how to isolate without
      // making assertions about implementation, which will make for britle tests.

      // Post two photos and one tag for each.
      const images = await db.image.createManyAndReturn({
        data: [
          {
            id: '1',
            url: 'jasmine.jpg',
            altText: 'jasmine',
          },
          {
            id: '2',
            url: 'meg.jpg',
            altText: 'meg',
          },
        ],
      });

      const tags = await db.imageTag.createManyAndReturn({
        data: [
          {
            id: '1',
            imageId: '1',
            name: 'Jasmine',
            posX: 0,
            posY: 0,
          },
          {
            id: '2',
            imageId: '2',
            name: 'Meg',
            posX: 1,
            posY: 1,
          },
        ],
      });

      let response;

      // We don't know which photo it will give us first.
      response = await request(app).get('/api/v1/photo');
      expect(response.statusCode).toStrictEqual(200);

      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();

      // Need to repeat this for first then second photo, so make it a function.
      const testFindingAllPhotoTags = async (photo, photoTags) => {
        for (let i = 0; i < photoTags.length; i++) {
          const tag = photoTags[i];
          response = await request(app)
            .post('/api/v1/check-tag')
            .set('cookie', cookie)
            .send({
              photoId: photo.id,
              tagId: tag.id,
              posX: tag.posX,
              posY: tag.posY,
            });
          expect(response.statusCode).toStrictEqual(200);
          expect(response.body.data.foundTags).toContainEqual(tag);
        }
        expect(response.body.data.foundTags.length).toStrictEqual(
          photoTags.length,
        );
        expect(response.body.data.foundAllTags).toStrictEqual(true);
      };

      // Find all tags on the first photo.
      const photoA = response.body.data.photo;
      expect(photoA).toBeDefined();
      await testFindingAllPhotoTags(
        photoA,
        tags.filter(({ imageId }) => imageId === photoA.id),
      );

      // Get second photo, find the tag.
      response = await request(app).get('/api/v1/photo').set('cookie', cookie);
      expect(response.statusCode).toStrictEqual(200);

      const photoB = response.body.data.photo;
      expect(photoB).toBeDefined();
      await testFindingAllPhotoTags(
        photoB,
        tags.filter(({ imageId }) => imageId === photoB.id),
      );

      // Get first photo again.
      response = await request(app).get('/api/v1/photo').set('cookie', cookie);
      expect(response.statusCode).toStrictEqual(200);
      // Make sure we are dealing with the first photo that was already completed.
      expect(response.body.data.photo).toStrictEqual(photoA);

      // Fail to hit tag! Found tags should be empty, foundAllTags false.
      response = await request(app)
        .post('/api/v1/check-tag')
        .set('cookie', cookie)
        .send({
          photoId: photoA.id,
          tagId: tags.find((tag) => tag.id === photoA.id).id,
          // The created tags have posX: 0 or 1, posY: 0 or 1, so this will
          // match neither, no matter what photo and tag we are looking at.
          posX: 0.5,
          posY: 0.5,
        });
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          foundAllTags: false,
          foundTags: [],
        },
      });
    });
  });
});

describe('/api/v1/time', () => {
  describe('GET', () => {
    it('responds with a status code 404 and json message if the user has not requested a photo yet', async () => {
      const response = await request(app).get('/api/v1/time');
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          message:
            'Session currentPhotoId is undefined; client has not requested an image before requesting best times',
        },
      });
    });

    it("responds with a status code 200 and the top 10 best times for user's current photo", async () => {
      await postTestData();
      const testImage = testImageDataAbsoluteUrl[0];

      // Make sure there are more than 10 entries - want to make sure the route returns a maximum of 10.
      const testImageTimes = await db.imageTime.findMany({
        // Exactly the same as api prisma query.
        where: {
          imageId: testImage.id,
        },
        orderBy: [
          {
            timeMs: 'asc',
          },
          {
            id: 'asc',
          },
        ],
        take: 10,
      });
      expect(testImageTimes.length).toStrictEqual(10);

      // Get rid of all images except image we are testing, so we know what image we will get from /api/v1/photo.
      await db.image.deleteMany({
        where: {
          id: {
            not: testImage.id,
          },
        },
      });

      let response;

      // Grab an image to start with, so session has a currentPhotoId set.
      response = await request(app).get('/api/v1/photo');
      expect(response.statusCode).toStrictEqual(200);

      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();

      response = await request(app).get('/api/v1/time').set('cookie', cookie);
      expect(response.statusCode).toStrictEqual(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: {
          bestTimes: testImageTimes,
        },
      });
    });
  });

  describe('POST', () => {
    it('responds with a status code 404 and json message if the user has not requested a photo yet', async () => {
      const response = await request(app).post('/api/v1/time');
      expect(response.statusCode).toStrictEqual(404);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          message:
            'Session currentPhotoId is undefined; client has not requested an image before requesting best times',
        },
      });
    });

    it('responds with a status code 400 if the user has not found all photo tags yet', async () => {
      await postTestData();

      const testImage = await db.image.findFirst({
        include: {
          tags: true,
        },
      });
      expect(testImage).toBeDefined();
      // Make sure there are actually tags to find on the test data, otherwise this test could be a false pass.
      expect(testImage.tags.length).toBeGreaterThan(0);

      let response;
      response = await request(app).get('/api/v1/photo');
      expect(response.statusCode).toStrictEqual(200);

      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();

      response = await request(app).post('/api/v1/time').set('cookie', cookie);
      expect(response.statusCode).toStrictEqual(400);
      expect(response.body).toStrictEqual({
        status: 'fail',
        data: {
          message:
            'Cannot set a time since you have not found all the tags for this image yet.',
        },
      });
    });

    // Test validation of request body fields once user has found all tags.
    it.each([
      {
        testType: 'no name',
        sendObj: {
          imageId: '1',
          name: undefined,
        },
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
            {
              location: 'body',
              msg: 'name should be 3 characters long',
              path: 'name',
              type: 'field',
              value: '',
            },
          ],
        },
      },
      {
        testType: 'name of length smaller than 3',
        sendObj: {
          name: 'ab',
        },
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'name should be 3 characters long',
              path: 'name',
              type: 'field',
              value: 'ab',
            },
          ],
        },
      },
      {
        testType: 'name of length larger than 3',
        sendObj: {
          name: 'abcd',
        },
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'name should be 3 characters long',
              path: 'name',
              type: 'field',
              value: 'abcd',
            },
          ],
        },
      },
      {
        testType: 'name with invalid characters',
        sendObj: {
          name: '@bc',
        },
        expectedValidationObj: {
          errors: [
            {
              location: 'body',
              msg: 'name should contain alphanumeric characters only',
              path: 'name',
              type: 'field',
              value: '@bc',
            },
          ],
        },
      },
    ])(
      'when provided with $testType, responds with a status code 400 and validation errors',
      async ({ sendObj, expectedValidationObj }) => {
        await postTestData();
        const testImage = testImageDataAbsoluteUrl[0];

        // Delete all but test photo so we know what /api/v1/photo will give us.
        await db.image.deleteMany({
          where: {
            id: {
              not: testImage.id,
            },
          },
        });

        // Get tags.
        const tags = await db.imageTag.findMany({
          where: {
            imageId: testImage.id,
          },
        });
        expect(tags.length).toBeGreaterThan(0);

        let response;
        // Request image so session gets properly set up.
        response = await request(app).get('/api/v1/photo');
        expect(response.statusCode).toStrictEqual(200);

        // Save cookie for later requests.
        const cookie = response.headers['set-cookie'];
        expect(cookie).toBeDefined();

        // Find all tags so we can then post a time.
        for (const tag of tags) {
          response = await request(app)
            .post('/api/v1/check-tag')
            .set('cookie', cookie)
            .send({
              tagId: tag.id,
              photoId: testImage.id,
              posX: tag.posX,
              posY: tag.posY,
            });
          expect(response.statusCode).toStrictEqual(200);
        }
        expect(response.body.data.foundAllTags).toStrictEqual(true);

        // Now we can test the validation of the request body fields.
        response = await request(app)
          .post('/api/v1/time')
          .set('cookie', cookie)
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
    'with $testType, find tag within 0.1 of that position, add to found tags list and return all found tags',
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
      expect(response.body.data.foundTags[0]?.name).toStrictEqual(expectedName);
    },
  );

  it.each([
    {
      testType: 'a tagId of 1',
      posX: '0.5',
      posY: '0.5',
      tagId: '1',
      expectedTagId: '1',
    },
    {
      testType: 'a tagId of 2',
      posX: '0.5',
      posY: '0.5',
      tagId: '2',
      expectedTagId: '2',
    },
  ])(
    'with $testType and multiple tags at that location, only find the matched tag, and return all found tags',
    async ({ posX, posY, tagId, expectedTagId }) => {
      // Post our own photo and tags, so we can compare to those within the test and easily see what we are comparing to.
      const photo = await db.image.create({
        data: {
          altText: 'my alt text',
          url: 'my-url.jpg',
        },
      });

      await db.imageTag.createMany({
        data: [
          {
            id: '1',
            imageId: photo.id,
            name: 'Jasmine',
            posX: 0.5,
            posY: 0.5,
          },
          {
            id: '2',
            imageId: photo.id,
            name: 'Meg',
            posX: 0.5,
            posY: 0.5,
          },
        ],
      });

      const response = await request(app)
        .post('/api/v1/check-tag')
        .send({ photoId: photo.id, posX, posY, tagId });

      expect(response.statusCode).toStrictEqual(200);
      expect(response.body.data.foundTags[0].id).toStrictEqual(expectedTagId);
    },
  );

  it('if the same tag is found multiple times, only count it once', async () => {
    // Post our own photo and tags, so we can compare to those within the test and easily see what we are comparing to.
    const photo = await db.image.create({
      data: {
        altText: 'my alt text',
        url: 'my-url.jpg',
      },
    });

    await db.imageTag.createMany({
      data: [
        {
          id: '1',
          imageId: photo.id,
          name: 'Jasmine',
          posX: 0,
          posY: 0,
        },
        {
          id: '2',
          imageId: photo.id,
          name: 'Meg',
          posX: 1,
          posY: 1,
        },
      ],
    });

    let response;

    const sendObj = {
      photoId: photo.id,
      posX: 0,
      posY: 0,
      tagId: '1',
    };

    response = await request(app).post('/api/v1/check-tag').send(sendObj);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.body.data.foundAllTags).toStrictEqual(false);

    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeDefined();

    response = await request(app)
      .post('/api/v1/check-tag')
      .set('cookie', cookie)
      .send(sendObj);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.body.data.foundAllTags).toStrictEqual(false);
  });

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
        foundTags: testImageTags.filter((tag) => ['Avi'].includes(tag.name)),
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
        foundTags: testImageTags.filter((tag) =>
          ['Avi', 'Shera'].includes(tag.name),
        ),
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
        foundTags: testImageTags.filter((tag) =>
          ['Avi', 'Shera', 'Yoshi'].includes(tag.name),
        ),
      },
    });

    // Restore mocked timers.
    vi.useRealTimers();
  });
});
