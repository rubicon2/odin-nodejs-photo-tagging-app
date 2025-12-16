import { defaultOptions } from './fetchOptions';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function fetchPhotosWithTags() {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo`,
    defaultOptions,
  );
  return response;
}

async function fetchPhotoWithTags() {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo`,
    defaultOptions,
  );
  return response;
}

async function postPhoto(body: BodyInit) {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`, {
    ...defaultOptions,
    method: 'POST',
    body,
  });
  return response;
}

async function putPhoto(body: BodyInit) {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`, {
    ...defaultOptions,
    method: 'PUT',
    body,
  });
  return response;
}

async function deletePhotos() {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`, {
    ...defaultOptions,
    method: 'DELETE',
  });
  return response;
}

async function deletePhoto(photoId: string) {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo/${photoId}`, {
    ...defaultOptions,
    method: 'DELETE',
  });
  return response;
}

async function getPhotoTags(photoId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag`,
    defaultOptions,
  );
  return response;
}

async function getPhotoTag(photoId: string, tagId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag/${tagId}`,
    defaultOptions,
  );
  return response;
}

async function postPhotoTag(photoId: string, body: BodyInit) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag`,
    {
      ...defaultOptions,
      method: 'POST',
      body,
    },
  );
  return response;
}

async function putPhotoTags(
  photoId: string,
  createTags: Array<Tag> = [],
  updateTags: Array<Required<Tag>> = [],
  deleteTags: Array<string> = [],
) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag`,
    {
      ...defaultOptions,
      method: 'PUT',
      headers: {
        // This needs to be set otherwise server json middleware will not do anything.
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        create: createTags,
        update: updateTags,
        delete: deleteTags,
      }),
    },
  );
  return response;
}

async function putPhotoTag(photoId: string, tagId: string, body: BodyInit) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag/${tagId}`,
    {
      ...defaultOptions,
      method: 'PUT',
      body,
    },
  );
  return response;
}

async function deletePhotoTags(photoId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag`,
    {
      ...defaultOptions,
      method: 'POST',
    },
  );
  return response;
}

async function deletePhotoTag(photoId: string, tagId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag/${tagId}`,
    {
      ...defaultOptions,
      method: 'DELETE',
    },
  );
  return response;
}

export {
  fetchPhotosWithTags,
  fetchPhotoWithTags,
  postPhoto,
  putPhoto,
  deletePhotos,
  deletePhoto,
  getPhotoTags,
  getPhotoTag,
  postPhotoTag,
  putPhotoTags,
  putPhotoTag,
  deletePhotoTags,
  deletePhotoTag,
};
