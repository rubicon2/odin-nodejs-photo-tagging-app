import { RAILWAY_VOLUME_MOUNT_PATH, VITE_SERVER_URL } from '../env.mjs';
import client from '../db/client.mjs';
import fs from 'node:fs/promises';
import createImgUrl from '../ext/createImgUrl.mjs';

function get(req, res) {
  return res.send({
    status: 'success',
    data: {
      message: 'A message from the api.',
    },
  });
}

async function postPhoto(req, res) {
  // Multer gets file data.
  const image = req.file;
  // Contains details of people tagged in the photo.
  const { altText } = req.body;

  console.log('image uploaded:', image);

  // Putting server domain as part of url is a bad idea, since it could change!
  // Save filename as url and put it together with domain and static dir before sending.
  const dbEntry = await client.image.create({
    data: {
      url: image.filename,
      altText,
    },
  });

  console.log('new db image entry:', dbEntry);

  // Form can also include data like tagged people. E.g. 'tag' and you click on the image and it logs it.
  return res.send({
    status: 'success',
    data: {
      message: 'Post photo mode successfully accessed!',
      image: {
        ...dbEntry,
        url: createImgUrl(dbEntry.url),
      },
    },
  });
}

async function getPhotoIndex(req, res, next) {
  try {
    const files = await fs.readdir(RAILWAY_VOLUME_MOUNT_PATH);
    return res.send({
      status: 'success',
      data: {
        files,
      },
    });
  } catch (error) {
    next(error);
  }
}

function getPhoto(req, res) {
  // return db entry of photo. that will contain the url to the public /static/photo url,
  // and other details. E.g. id, which can be used to check db tags when user clicks on the image.
  return res.send({
    status: 'success',
    data: {
      image: {
        // Now this is working, how to upload new images and set up stuff?
        url: `${VITE_SERVER_URL}/data/dale.jpg`,
      },
    },
  });
}

export { get, getPhoto, postPhoto, getPhotoIndex };
