import client from '../../db/client.mjs';
import createImgUrl from '../../ext/createImgUrl.mjs';
import { deleteFile } from '../../ext/volume.mjs';
import { validationResult, matchedData } from 'express-validator';

// /photo
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
    return res.json({
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

async function postPhoto(req, res) {
  // Multer gets file data.
  const photo = req.file;
  // Get altText from body if it is there.
  const altText = req.body?.altText;

  // Mimic the format of express-validator errors, so the client can use one method to display both.
  if (!photo || !altText) {
    let validation = {
      errors: [],
    };

    if (!photo) {
      validation.errors.push({
        location: 'body',
        msg: 'Photo is a required field',
        path: 'photo',
        type: 'field',
        value: '',
      });
    }

    if (!altText) {
      validation.errors.push({
        location: 'body',
        msg: 'AltText is a required field',
        path: 'altText',
        type: 'field',
        value: '',
      });
    }

    return res.status(400).json({
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
  return res.json({
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

// /photo/:id
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
    const newPhoto = req.file;
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

    // If no altText or photo uploaded, return a message.
    if (newPhoto === undefined && altText === undefined) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message:
            'No altText or photo have been provided, so no updates have been made.',
        },
      });
    }

    // If field missing from body, do not update to empty field/undefined/null on db.
    const data = {};
    if (newPhoto) {
      // If new photo, delete image stored at old url.
      // Otherwise we will lose path to this file and be unable to access or delete it!
      const previousUrl = existingPhoto.url;
      deleteFile(previousUrl);
      // Now get url of new file, which has already been uploaded by multer middleware.
      data.url = newPhoto.filename;
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
      return res.status(404).json({
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

    return res.json({
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

// /photo/:photoId/tag
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

async function updatePhotoTags(req, res, next) {
  // Takes a req.body with 3 arrays:
  // create (tags with no ids), update (tags with ids), and delete (ids).
  // Each is validated separately due to the different validation requirements.
  // Trying to lump them all together is where I screwed up last time. Got way too complicated.
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

    // Need to use an interactive transaction like this, in order to
    // iterate over the update and delete operations. There is no way
    // to update or delete a bunch of stuff at once, with different
    // where clauses (e.g. updateManyAndReturn can only use one where).
    const [created, updated, deleted] = await client.$transaction(
      async (prisma) => {
        const created = await prisma.imageTag.createManyAndReturn({
          data: validatedData.create || [],
        });

        const updated = [];
        for (const update of validatedData.update || []) {
          const { id, ...data } = update;
          const updatedTag = await prisma.imageTag.update({
            where: {
              id,
            },
            data,
          });
          updated.push(updatedTag);
        }

        const deleted = [];
        for (const id of validatedData.delete || []) {
          const deletedTag = await prisma.imageTag.delete({
            where: {
              id,
            },
          });
          deleted.push(deletedTag);
        }

        return [created, updated, deleted];
      },
    );

    return res.json({
      status: 'success',
      data: {
        message: 'Tags successfully updated.',
        created,
        updated,
        deleted,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAllPhotoTags(req, res, next) {
  try {
    // Check photo exists before looking for tag, so we can give better error messages.
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

    await client.imageTag.deleteMany({
      where: {
        imageId: req.params.photoId,
      },
    });

    return res.json({
      status: 'success',
      data: {
        message: `Tags for photo ${req.params.photoId} successfully deleted.`,
      },
    });
  } catch (error) {
    next(error);
  }
}

// /photo/:photoId/tag/:tagId
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

async function putPhotoTag(req, res, next) {
  try {
    // Check photo exists before looking for tag, so we can give better error messages.
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

    // Check tag exists before trying to update, otherwise prisma will throw an error.
    const existingTag = await client.imageTag.findUnique({
      where: {
        id: req.params.tagId,
      },
    });

    if (!existingTag) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That tag does not exist.',
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

    // This grabs whatever data that has passed validation.
    // We have already checked for validation errors, so if we get to this point
    // and no data is grabbed, that means the user didn't put any data on the request.
    const validatedData = matchedData(req);

    // If there is no data, return a status 400 and json message.
    if (
      validatedData.posX === undefined &&
      validatedData.posY === undefined &&
      validatedData.name === undefined
    ) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message:
            'No posX, posY, or name have been provided, so no updates have been made.',
        },
      });
    }

    const updatedTag = await client.imageTag.update({
      where: {
        id: req.params.tagId,
        imageId: req.params.imageId,
      },
      data: {
        ...validatedData,
      },
    });

    return res.json({
      status: 'success',
      data: {
        message: 'Tag successfully updated.',
        tag: updatedTag,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deletePhotoTag(req, res, next) {
  try {
    const { photoId, tagId } = req.params;
    // Check photo exists before looking for tag, so we can give better error messages.
    const existingPhoto = await client.image.findUnique({
      where: {
        id: photoId,
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

    // Now check tag exists.
    const existingTag = await client.imageTag.findUnique({
      where: {
        id: tagId,
        imageId: photoId,
      },
    });

    if (!existingTag) {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: 'That tag does not exist.',
        },
      });
    }

    await client.imageTag.delete({
      where: {
        id: tagId,
      },
    });

    return res.json({
      status: 'success',
      data: {
        message: `Photo tag successfully deleted.`,
      },
    });
  } catch (error) {
    next(error);
  }
}

export {
  // /photo
  getAllPhotosAndTags,
  postPhoto,
  deleteAllPhotos,
  // /photo/:id
  getPhotoAndTags,
  putPhoto,
  deletePhoto,
  // /photo/:photoId/tag
  getAllPhotoTags,
  updatePhotoTags,
  deleteAllPhotoTags,
  // /photo/:photoId/tag/:tagId
  getPhotoTag,
  postPhotoTag,
  putPhotoTag,
  deletePhotoTag,
};
