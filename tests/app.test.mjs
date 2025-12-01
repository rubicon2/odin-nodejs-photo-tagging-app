import app from '../server/src/app.mjs';
import { testImagePath } from './helpers/helpers.mjs';
import { describe, it, test, expect } from 'vitest';
import { request } from 'sagetest';
import fs from 'node:fs/promises';

describe('app', () => {
  it('default export should have a listen function for responding to requests', () => {
    expect(typeof app.listen).toBe('function');
  });

  test('flow: failing to post an image, enabling admin mode, then succeeding to post an image', async () => {
    process.env.ADMIN_PASSWORD = 'my mega password';

    let response, cookie;

    // Fail to post an image as admin mode not enabled.
    // With new Session migration to prisma, this request gives strange errors.
    // supertest double callback bug?
    response = await request(app)
      .post('/api/v1/admin/photo')
      .field('altText', 'my alt text')
      .attach('photo', testImagePath);
    expect(response.statusCode).toStrictEqual(403);

    // Extract cookie so we can use in future requests.
    cookie = response.headers['set-cookie'];

    // Enable admin mode by supplying the password.
    response = await request(app)
      .post('/api/v1/auth/enable-admin')
      .set('cookie', cookie)
      .send({ password: process.env.ADMIN_PASSWORD });
    expect(response.statusCode).toStrictEqual(200);

    // Try to post an image again, succeed now admin mode is enabled.
    response = await request(app)
      .post('/api/v1/admin/photo')
      .set('cookie', cookie)
      .field('altText', 'my alt text')
      .attach('photo', testImagePath);
    expect(response.statusCode).toStrictEqual(200);

    // Check image has been uploaded, etc.
    response = await request(app).get('/api/v1/photo');
    expect(response.statusCode).toStrictEqual(200);
    expect(response.body.data.photo).toBeDefined();
    const photo = response.body.data.photo;
    expect(photo.altText).toStrictEqual('my alt text');
    expect(photo.url).toMatch(/^.*.[a-zA-Z]?/i);

    // Check we can get image from url.
    response = await request(app).get(photo.url);
    expect(response.statusCode).toStrictEqual(200);
    // Check the image matches the test file we provided in the post request.
    const testFile = await fs.readFile(testImagePath);
    expect(testFile.equals(response.body)).toStrictEqual(true);
  });

  test('flow: in admin mode, post an image and then disable admin mode, try and fail to post another image', async () => {
    process.env.ADMIN_PASSWORD = 'my mega password';

    let response, cookie;

    // Enable admin mode by supplying the password, so we can log out.
    response = await request(app)
      .post('/api/v1/auth/enable-admin')
      .send({ password: process.env.ADMIN_PASSWORD });
    expect(response.statusCode).toStrictEqual(200);

    // Extract cookie.
    cookie = response.headers['set-cookie'];

    // Succesfully post an image.
    response = await request(app)
      .post('/api/v1/admin/photo')
      .set('cookie', cookie)
      .field('altText', 'my alt text')
      .attach('photo', testImagePath);
    expect(response.statusCode).toStrictEqual(200);

    // Disable admin mode.
    response = await request(app)
      .post('/api/v1/auth/disable-admin')
      .set('cookie', cookie);
    expect(response.statusCode).toStrictEqual(200);

    // Now try and fail to post another image.
    response = await request(app)
      .post('/api/v1/admin/photo')
      .set('cookie', cookie)
      .field('altText', 'my alt text')
      .attach('photo', testImagePath);
    expect(response.statusCode).toStrictEqual(403);
  });
});
