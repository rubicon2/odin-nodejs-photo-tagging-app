import db from '../../server/src/db/client.mjs';
import createImgUrl from '../../server/src/ext/createImgUrl.mjs';
import fs from 'node:fs/promises';

async function clearDb() {
  await db.$transaction([db.image.deleteMany(), db.imageTag.deleteMany()]);
}

const testImagePath = `${process.cwd()}/tests/test_image.png`;

const testImageData = [
  {
    id: '1',
    url: 'my-image-url.jpg',
    altText: 'my-image-alt-text',
  },
  {
    id: '2',
    url: 'my-second-image.jpg',
    altText: 'my-second-image',
  },
];

const testImageDataAbsoluteUrl = testImageData.map((image) => ({
  ...image,
  url: createImgUrl(image.url),
}));

const testImageTagData = [
  {
    id: '1',
    posX: 100,
    posY: 200,
    name: 'sam',
    imageId: '1',
  },
  {
    id: '2',
    posX: 200,
    posY: 200,
    name: "sam's sister",
    imageId: '1',
  },
  {
    id: '3',
    posX: 720,
    posY: 79,
    name: 'hiro',
    imageId: '2',
  },
];

const testImageDataAbsoluteUrlWithTags = testImageDataAbsoluteUrl.map(
  (image) => ({
    ...image,
    tags: testImageTagData.filter((tag) => image.id === tag.imageId),
  }),
);

function createTailRegExp(str) {
  // Matches the end of a string and ignores any leading characters.
  return new RegExp(`^.*${str}`);
}

async function uploadVolumeFile(to, from = testImagePath) {
  await fs.copyFile(from, `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/${to}`);
}

async function readVolumeFile(from) {
  const uploadedFile = await fs.readFile(
    `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/${from}`,
  );
  return uploadedFile;
}

async function postTestData() {
  // Create test data for tests about retrieving data.
  const images = await db.image.createManyAndReturn({
    data: testImageData,
  });

  for (const image of images) {
    await uploadVolumeFile(image.url);
  }

  await db.imageTag.createMany({
    data: testImageTagData,
  });
}

export {
  clearDb,
  createTailRegExp,
  testImagePath,
  testImageData,
  testImageDataAbsoluteUrl,
  testImageTagData,
  testImageDataAbsoluteUrlWithTags,
  postTestData,
  uploadVolumeFile,
  readVolumeFile,
};
