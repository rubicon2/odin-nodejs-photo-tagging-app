import client from '../db/client.mjs';
import createImgUrl from '../ext/createImgUrl.mjs';

function postEnableAdminMode(req, res) {
  // Put in some validation on the router to make sure this isn't blank.
  const password = req.body.password;

  if (
    // If admin_mode is already enabled, just skip the rest of the function.
    process.env.ADMIN_ENABLED === 'true' ||
    password === process.env.ADMIN_PASSWORD
  ) {
    process.env.ADMIN_ENABLED = true;
    return res.json({
      status: 'success',
      data: {
        message: 'Admin mode enabled.',
      },
    });
  }

  return res.status(401).json({
    status: 'fail',
    data: {
      message: 'Password was not correct, admin mode was not enabled.',
    },
  });
}

function postDisableAdminMode(req, res) {
  process.env.ADMIN_ENABLED = false;
  return res.json({
    status: 'success',
    data: {
      message: 'Admin mode disabled.',
    },
  });
}

async function getAllPhotos(req, res, next) {
  try {
    const photos = await client.image.findMany({});
    const photosWithUrls = photos.map((photo) => ({
      ...photo,
      url: createImgUrl(photo.url),
    }));
    return res.send({
      status: 'success',
      data: {
        message: 'All photos successfully retrieved.',
        photos: photosWithUrls,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await client.image.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      return res.send({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    }

    // If an image with that id was found.
    return res.send({
      status: 'success',
      data: {
        message: 'Photo successfully retrieved.',
        photo: {
          ...photo,
          url: createImgUrl(photo.url),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export { postEnableAdminMode, postDisableAdminMode, getAllPhotos, getPhoto };
