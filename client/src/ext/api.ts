import { defaultOptions } from './fetchOptions';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function postEnableAdmin(password: string) {
  const response = await fetch(`${SERVER_URL}/api/v1/auth/enable-admin`, {
    ...defaultOptions,
    method: 'POST',
    body: new URLSearchParams({ password }),
  });
  return response;
}

async function postDisableAdmin() {
  const response = await fetch(`${SERVER_URL}/api/v1/auth/disable-admin`, {
    ...defaultOptions,
    method: 'POST',
  });
  return response;
}

async function fetchPhotos() {
  const response = await fetch(`${SERVER_URL}/api/v1/photo`, defaultOptions);
  return response;
}

async function fetchPhoto(photoId: string) {
  const response = await fetch(
    `${SERVER_URL}/api/v1/photo/${photoId}`,
    defaultOptions,
  );
  return response;
}

async function postTagCheck(photoId: string, posX: Number, posY: Number) {
  const response = await fetch(`${SERVER_URL}/api/v1/check-tag`, {
    ...defaultOptions,
    method: 'POST',
    body: new URLSearchParams({
      photoId,
      posX: posX.toString(),
      posY: posY.toString(),
    }),
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
