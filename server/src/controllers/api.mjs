import client from '../db/client.mjs';
import createImgUrl from '../ext/createImgUrl.mjs';

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

export { getAllPhotos, getPhoto };
