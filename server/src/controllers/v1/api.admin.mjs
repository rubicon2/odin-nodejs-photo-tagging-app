import client from '../../db/client.mjs';
import createImgUrl from '../../ext/createImgUrl.mjs';
import { deleteFile } from '../../ext/volume.mjs';
import { validationResult, matchedData } from 'express-validator';

async function postPhoto(req, res) {
  // Multer gets file data.
  const photo = req.file;
  // Get altText from body if it is there.
  const altText = req.body?.altText;

  if (!photo || !altText) {
    let validation = {};
    if (!photo) validation.photo = 'Photo is a required field';
    if (!altText) validation.altText = 'Alt text is a required field';
    return res.status(400).send({
      status: 'fail',
      data: {
        validation,
      },
    });
  }

  console.log('Image uploaded:', photo);

  // Putting server domain as part of url is a bad idea, since it could change!
  // Save filename as url and put it together with domain and static dir before sending later.
  const dbEntry = await client.image.create({
    data: {
      url: photo.filename,
      altText,
    },
  });

  console.log('New db image entry:', dbEntry);

  // Form can also include data like tagged people. E.g. 'tag' and you click on the image and it logs it.
  return res.send({
    status: 'success',
    data: {
      message: 'Post photo mode successfully accessed!',
      photo: {
        ...dbEntry,
        url: createImgUrl(dbEntry.url),
      },
    },
  });
}

async function getAllPhotosAndTags(req, res, next) {
  try {
    const photos = await client.image.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        tags: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
    const photosWithUrls = photos.map((photo) => ({
      ...photo,
      url: createImgUrl(photo.url),
    }));
    return res.send({
      status: 'success',
      data: {
        message: 'All photos with tags successfully retrieved.',
        photos: photosWithUrls,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getPhotoAndTags(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await client.image.findUnique({
      where: {
        id,
      },
      include: {
        tags: {
          orderBy: {
            id: 'asc',
          },
        },
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
        message: 'Photo with tags successfully retrieved.',
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

async function putPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const url = req.body?.url;
    const altText = req.body?.altText;

    // Check id exists on db table before doing anything else.
    const existingPhoto = await client.image.findUnique({
      where: {
        id,
      },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    }

    // If field missing from body, do not update to empty field/undefined/null on db.
    const data = {};
    if (url) {
      // If new url, delete image stored at old url.
      // Otherwise we will lose path to this file and be unable to access or delete it!
      const previousUrl = existingPhoto.url;
      deleteFile(previousUrl);
      data.url = url;
    }
    if (altText) data.altText = altText;

    const photo = await client.image.update({
      where: {
        id,
      },
      data,
    });

    console.log('Photo updated:', photo.id);

    return res.json({
      status: 'success',
      data: {
        message: 'Photo successfully updated.',
        photo,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAllPhotos(req, res, next) {
  try {
    const photos = await client.image.findMany();
    for (const photo of photos) {
      // For each entry removed from db, delete corresponding file.
      await deleteFile(photo.url);
      await client.image.delete({ where: { id: photo.id } });
      console.log('Photo deleted:', photo.id);
    }
    // Clear any photos that may exist on filesystem but not on db?
    return res.json({
      status: 'success',
      data: {
        message: 'All photos successfully deleted from the filesystem and db',
        photos,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deletePhoto(req, res, next) {
  try {
    const { id } = req.params;

    // Check if photo exists before deleting, otherwise prisma could throw an error.
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

    await client.image.delete({
      where: {
        id,
      },
    });

    // Delete from filesystem. Probably don't have to wait for this, but just in case.
    await deleteFile(photo.url);

    return res.send({
      status: 'success',
      data: {
        message: 'Photo successfully deleted.',
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

async function getAllPhotoTags(req, res, next) {
  try {
    // Check photo exists so we can give a more appropriate error message.
    const existingPhoto = await client.image.findUnique({
      where: {
        id: req.params.photoId,
      },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    }

    // If photo does exist, get tags and return them.
    const tags = await client.imageTag.findMany({
      where: {
        imageId: req.params.photoId,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return res.json({
      status: 'success',
      data: {
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getPhotoTag(req, res, next) {
  try {
    // Check photo exists so we can give a more appropriate error message.
    const existingPhoto = await client.image.findUnique({
      where: {
        id: req.params.photoId,
      },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
        },
      });
    }

    const tag = await client.imageTag.findUnique({
      where: {
        id: req.params.tagId,
      },
    });

    if (!tag) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That tag does not exist.',
        },
      });
    }

    return res.json({
      status: 'success',
      data: {
        tag,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function postPhotoTag(req, res, next) {
  try {
    // Check photo exists before trying to create a tag for it.
    const existingPhoto = await client.image.findUnique({
      where: {
        id: req.params.photoId,
      },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That photo does not exist.',
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

    const validatedData = matchedData(req);

    const tag = await client.imageTag.create({
      data: {
        imageId: req.params.photoId,
        ...validatedData,
      },
    });

    return res.json({
      status: 'success',
      data: {
        message: 'Tag successfully created.',
        tag,
      },
    });
  } catch (error) {
    next(error);
  }
}

export {
  postPhoto,
  getAllPhotosAndTags,
  getPhotoAndTags,
  putPhoto,
  deleteAllPhotos,
  deletePhoto,
  getAllPhotoTags,
  getPhotoTag,
  postPhotoTag,
};
