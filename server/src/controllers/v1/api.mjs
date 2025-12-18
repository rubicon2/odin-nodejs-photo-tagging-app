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
          orderBy: [
            {
              name: 'asc',
            },
            // As usual, use id as a tie-breaker to ensure consistent results.
            // Otherwise, if two or more entries have the same name, they will
            // be returned in randomly different orders.
            {
              id: 'asc',
            },
          ],
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
    // Clear any existing data.
    req.session.foundTags = [];
    req.session.foundAllTags = false;
    req.session.msToFinish = undefined;
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

async function getPhotoTopTimes(req, res, next) {
  // Use session currentPhotoId to determine what times to get.
  try {
    const currentPhotoId = req.session?.currentPhotoId;

    if (!currentPhotoId) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: `Session currentPhotoId is ${currentPhotoId}; client has not requested an image before requesting best times`,
        },
      });
    }

    const tenQuickestTimes = await client.imageTime.findMany({
      where: {
        imageId: currentPhotoId,
      },
      orderBy: [
        {
          timeMs: 'asc',
        },
        {
          // Tie breaker for entries with exactly the same time, to ensure consistent, testable results.
          id: 'asc',
        },
      ],
      take: 10,
    });

    return res.json({
      status: 'success',
      data: {
        bestTimes: tenQuickestTimes,
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
    req.session.foundAllTags = foundAllTags;

    // Make undefined, so if foundAllTags is false, will just be left out of json.
    let msToFinish = undefined;
    if (foundAllTags && req.session.startTime) {
      msToFinish = Date.now() - req.session.startTime;
      req.session.msToFinish = msToFinish;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        foundAllTags: req.session.foundAllTags,
        msToFinish: req.session.msToFinish,
        foundTags: req.session.foundTags,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function postPhotoTopTime(req, res, next) {
  try {
    const currentPhotoId = req.session?.currentPhotoId;
    if (!currentPhotoId) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: `Session currentPhotoId is ${currentPhotoId}; client has not requested an image before requesting best times`,
        },
      });
    }

    if (req.session?.foundAllTags !== true) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message: `Cannot set a time since you have not found all the tags for this image yet.`,
        },
      });
    }

    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: {
          validation,
        },
      });
    }

    const data = matchedData(req);

    const time = await client.imageTime.create({
      data: {
        imageId: req.session.currentPhotoId,
        timeMs: req.session.msToFinish,
        name: data.name,
      },
    });

    return res.json({
      status: 'success',
      data: {
        message: 'Time added to the leaderboard.',
        time,
      },
    });
  } catch (error) {
    next(error);
  }
}

export { getRandomPhoto, getPhotoTopTimes, postCheckTag, postPhotoTopTime };
