import client from '../../db/client.mjs';
import createImgUrl from '../../ext/createImgUrl.mjs';
import { validationResult, matchedData } from 'express-validator';

async function getAllPhotos(req, res, next) {
  try {
    const photos = await client.image.findMany({
      orderBy: {
        id: 'asc',
      },
    });
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
      return res.status(404).send({
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

async function postCheckTag(req, res, next) {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: {
          validation,
        },
      });
    }

    const { photoId, posX, posY } = matchedData(req);
    const tolerance = 0.1;

    const tags = await client.imageTag.findMany({
      where: {
        imageId: photoId,
        posX: {
          lte: posX + tolerance,
          gte: posX - tolerance,
        },
        posY: {
          lte: posY + tolerance,
          gte: posY - tolerance,
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
}

export { getAllPhotos, getPhoto, postCheckTag };
