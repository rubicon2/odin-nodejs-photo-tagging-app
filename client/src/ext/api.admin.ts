const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function fetchPhotosWithTags() {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`);
  return response;
}

async function fetchPhotoWithTags() {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`);
  return response;
}

async function postPhoto(body: BodyInit) {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`, {
    method: 'POST',
    body,
  });
  return response;
}

async function putPhoto(body: BodyInit) {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`, {
    method: 'PUT',
    body,
  });
  return response;
}

async function deletePhotos() {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo`, {
    method: 'DELETE',
  });
  return response;
}

async function deletePhoto(photoId: string) {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/photo/${photoId}`, {
    method: 'DELETE',
  });
  return response;
}

async function getPhotoTags(photoId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag`,
  );
  return response;
}

async function getPhotoTag(photoId: string, tagId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag/${tagId}`,
  );
  return response;
}

async function postPhotoTag(photoId: string, body: BodyInit) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag`,
    {
      method: 'POST',
      body,
    },
  );
  return response;
}

async function putPhotoTag(photoId: string, tagId: string, body: BodyInit) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag/${tagId}`,
    {
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
      method: 'POST',
    },
  );
  return response;
}

async function deletePhotoTag(photoId: string, tagId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/admin/photo/${photoId}/tag/${tagId}`,
    {
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
  putPhotoTag,
  deletePhotoTags,
  deletePhotoTag,
};
