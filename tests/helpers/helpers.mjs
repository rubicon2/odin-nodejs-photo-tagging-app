import db from '../../server/src/db/client.mjs';
import createImgUrl from '../../server/src/ext/createImgUrl.mjs';

async function clearDb() {
  await db.$transaction([db.image.deleteMany(), db.imageTag.deleteMany()]);
}

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

async function postTestData() {
  // Create test data for tests about retrieving data.
  await db.image.createMany({
    data: testImageData,
  });

  await db.imageTag.createMany({
    data: testImageTagData,
  });
}

export {
  clearDb,
  testImageData,
  testImageDataAbsoluteUrl,
  testImageTagData,
  postTestData,
};
