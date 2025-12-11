import db from '../../server/src/db/client.mjs';
import createImgUrl from '../../server/src/ext/createImgUrl.mjs';
import fs from 'node:fs/promises';

async function clearDb() {
  await db.$transaction([
    db.image.deleteMany(),
    db.imageTag.deleteMany(),
    db.imageTime.deleteMany(),
  ]);
}

async function clearFiles() {
  const allImages = await db.image.findMany();
  const allUrls = allImages.map((image) => image.url);
  for (const url of allUrls) {
    try {
      const absoluteUrl = `${process.env.VOLUME_MOUNT_PATH}/${url}`;
      await fs.rm(absoluteUrl);
      console.log('Deleted:', absoluteUrl);
    } catch (error) {
      console.error(error);
    }
  }
}

const testImagePath = `${process.cwd()}/tests/test_image.png`;
const testImage2Path = `${process.cwd()}/tests/test_image_2.png`;

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

const testImageTimeData = testImageData
  .map((testImage, index) => {
    // Create a number of tags for each image and return in an array which will be flattened after.
    const testImageTimes = [];
    const maxTags = 20;
    for (let i = 0; i < maxTags; i++) {
      const baseTimeMs = 30000;
      const charCode = index + 65;
      testImageTimes.push({
        id: (i + 1 + index * maxTags).toString(),
        imageId: testImage.id,
        timeMs: baseTimeMs + baseTimeMs * i,
        name: `${String.fromCharCode(charCode)}${String.fromCharCode(charCode + i)}${String.fromCharCode(charCode + i + 1)}`,
      });
    }
    return testImageTimes;
  })
  // Since we are creating an array of arrays of times, i.e. multiple for each testImage, need to flatten array.
  .flat();

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
  await fs.copyFile(from, `${process.env.VOLUME_MOUNT_PATH}/${to}`);
}

async function readVolumeFile(from) {
  const uploadedFile = await fs.readFile(
    `${process.env.VOLUME_MOUNT_PATH}/${from}`,
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

  await db.imageTime.createMany({
    data: testImageTimeData,
  });
}

function logError(error, req, res, next) {
  console.error(error);
  res.status(500).send(error);
}

export {
  clearDb,
  clearFiles,
  createTailRegExp,
  testImagePath,
  testImage2Path,
  testImageData,
  testImageDataAbsoluteUrl,
  testImageTagData,
  testImageDataAbsoluteUrlWithTags,
  testImageTimeData,
  postTestData,
  uploadVolumeFile,
  readVolumeFile,
  logError,
};
