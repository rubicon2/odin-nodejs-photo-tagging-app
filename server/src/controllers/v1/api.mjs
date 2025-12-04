import client from '../../db/client.mjs';
import prismaToPhotoTransformer from '../../transformers/prismaToPhotoTransformer.mjs';
import createPostCheckTagQueryTransformer from '../../transformers/createPostCheckTagQueryTransformer.mjs';
import { validationResult, matchedData } from 'express-validator';

async function getRandomPhoto(req, res, next) {
  try {
    const idsToIgnore = req.session?.completedPhotoIds || [];
    if (req.session?.currentPhotoId)
      idsToIgnore.push(req.session.currentPhotoId);

    const photos = await client.image.findMany({
      where: {
        id: {
          notIn: idsToIgnore,
        },
      },
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

    if (photos.length === 0) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'No photos were found.',
        },
      });
    }

    const randomPhotoIndex = Math.floor(Math.random() * photos.length);
    const randomPhoto = photos[randomPhotoIndex];

    // Save so we know what photo the user is on and
    // can avoid giving the same photo twice in a row.
    req.session.currentPhotoId = randomPhoto.id;

    return res.json({
      status: 'success',
      data: {
        message: 'Photo successfully retrieved.',
        photo: prismaToPhotoTransformer(randomPhoto),
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
    const data = matchedData(req);
    const query = createQuery(data);

    const tags = await client.imageTag.findMany(query);
    // Add any found tags to an array in the session.
    req.session.foundTags = req.session.foundTags
      ? [...req.session.foundTags, ...tags]
      : tags;

    // Check found tags against total number of tags on
    // the image, so we know if the player has won.
    const image = await client.image.findUnique({
      where: {
        id: data.photoId,
      },
      include: {
        tags: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    const totalTags = image.tags.length;
    const foundAllTags = req.session.foundTags.length >= totalTags;

    return res.status(200).json({
      status: 'success',
      data: {
        foundAllTags,
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
}

export { getRandomPhoto, postCheckTag };
