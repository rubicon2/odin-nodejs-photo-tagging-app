import client from '../../db/client.mjs';
import prismaToPhotoTransformer from '../../transformers/prismaToPhotoTransformer.mjs';
import createPostCheckTagQueryTransformer from '../../transformers/createPostCheckTagQueryTransformer.mjs';
import { validationResult, matchedData } from 'express-validator';

async function getRandomPhoto(req, res, next) {
  try {
    // Put previous currentPhotoId in an array to make it easy to plop into prisma query.
    const idsToIgnore = req.session?.currentPhotoId
      ? [req.session.currentPhotoId]
      : [];

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
    // Clear any existing foundTags.
    req.session.foundTags = [];
    // Save start time so we can figure out how long it took for the user to find all the tags.
    req.session.startTime = Date.now();

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

    const tag = await client.imageTag.findUnique(query);

    if (!req.session.foundTags) req.session.foundTags = [];
    if (tag) {
      // Make sure tag has not already been found before adding to array.
      const foundTags = req.session.foundTags;
      if (!foundTags.find((existing) => existing.id === tag.id))
        foundTags.push(tag);
    }

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

    // Make undefined, so if foundAllTags is false, will just be left out of json.
    let msToFinish = undefined;
    if (foundAllTags && req.session.startTime) {
      msToFinish = Date.now() - req.session.startTime;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        foundAllTags,
        msToFinish,
        foundTags: req.session.foundTags,
      },
    });
  } catch (error) {
    next(error);
  }
}

export { getRandomPhoto, postCheckTag };
