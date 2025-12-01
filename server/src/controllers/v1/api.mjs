import client from '../../db/client.mjs';
import prismaToPhotoTransformer from '../../transformers/prismaToPhotoTransformer.mjs';
import createPostCheckTagQueryTransformer from '../../transformers/createPostCheckTagQueryTransformer.mjs';
import { validationResult, matchedData } from 'express-validator';

async function getAllPhotos(req, res, next) {
  try {
    const photos = await client.image.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        tags: {
          select: { id: true, name: true },
          orderBy: {
            id: 'asc',
          },
        },
        _count: {
          select: { tags: true },
        },
      },
    });
    return res.json({
      status: 'success',
      data: {
        message: 'All photos successfully retrieved.',
        photos: photos.map((photo) => prismaToPhotoTransformer(photo)),
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
      include: {
        tags: {
          select: { id: true, name: true },
          orderBy: {
            id: 'asc',
          },
        },
        _count: {
          select: { tags: true },
        },
      },
    });

    if (!photo) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    }

    // If an image with that id was found.
    return res.json({
      status: 'success',
      data: {
        message: 'Photo successfully retrieved.',
        photo: prismaToPhotoTransformer(photo),
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

    // Transform matched data into the query we want.
    const maxPosDiff = 0.1;
    const createQuery = createPostCheckTagQueryTransformer(maxPosDiff);
    const query = createQuery(matchedData(req));

    const tags = await client.imageTag.findMany(query);

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
