const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function postEnableAdmin(password) {
  const response = await fetch(`${SERVER_URL}/api/v1/auth/enable-admin`, {
    method: 'POST',
    body: new URLSearchParams({ password }),
  });
  return response;
}

async function postDisableAdmin() {
  const response = await fetch(`${SERVER_URL}/api/v1/auth/disable-admin`, {
    method: 'POST',
  });
  return response;
}

async function fetchPhotos() {
  const response = await fetch(`${SERVER_URL}/api/v1/photo`);
  return response;
}

async function fetchPhoto(photoId) {
  const response = await fetch(`${SERVER_URL}/api/v1/photo/${photoId}`);
  return response;
}

async function postTagCheck(photoId, posX, posY) {
  const response = await fetch(`${SERVER_URL}/api/v1/check-tag`, {
    method: 'POST',
    body: new URLSearchParams({ photoId, posX, posY }),
  });
  return response;
}

export {
  postEnableAdmin,
  postDisableAdmin,
  fetchPhotos,
  fetchPhoto,
  postTagCheck,
};
