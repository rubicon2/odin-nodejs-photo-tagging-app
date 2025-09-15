import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(import.meta.dirname, '../../.env'),
});

const MODE = process.env.MODE;
const VITE_SERVER_URL = process.env.VITE_SERVER_URL;
const VITE_IS_ADMIN = process.env.VITE_IS_ADMIN;
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_CORS_WHITELIST = process.env.SERVER_CORS_WHITELIST;
const SERVER_DATABASE_URL = process.env.SERVER_DATABASE_URL;
const RAILWAY_VOLUME_MOUNT_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH;

// Development/testing only.
const SERVER_TEST_DATABASE_URL = process.env.SERVER_TEST_DATABASE_URL;

// So if we forget to add .env vars and e.g. deploy fails, we will have useful errors.
function checkEnvComplete() {
  let errorMsg = '';
  if (!MODE) {
    errorMsg +=
      '\nMODE not defined in .env!\nShould be "development" or "production".\n';
  }
  if (!VITE_SERVER_URL) {
    errorMsg +=
      '\nVITE_SERVER_URL not defined in .env!\nInclude protocol and port.\n';
  }
  if (!VITE_IS_ADMIN) {
    errorMsg +=
      '\nVITE_IS_ADMIN not defined in .env!\nShould be true or false.\n';
  }
  if (!SERVER_PORT) {
    errorMsg += '\nSERVER_PORT not defined in .env!\n';
  }
  if (!SERVER_CORS_WHITELIST) {
    errorMsg +=
      '\nSERVER_CORS_WHITELIST not defined in .env!\nShould be a JSON array.\n';
  }
  if (!SERVER_DATABASE_URL) {
    errorMsg += '\nSERVER_DATABASE_URL not defined in .env!';
  }
  if (!RAILWAY_VOLUME_MOUNT_PATH) {
    errorMsg += '\nRAILWAY_VOLUME_MOUNT_PATH not defined in .env!';
  }

  // We only care aboue this in development mode.
  if (!SERVER_TEST_DATABASE_URL && MODE === 'development') {
    errorMsg += '\nSERVER_TEST_DATABASE_URL not defined in .env!';
  }

  if (errorMsg.length !== 0) throw new Error(errorMsg);
}

checkEnvComplete();

export {
  MODE,
  VITE_SERVER_URL,
  VITE_IS_ADMIN,
  SERVER_PORT,
  SERVER_CORS_WHITELIST,
  RAILWAY_VOLUME_MOUNT_PATH,
  SERVER_DATABASE_URL,
  SERVER_TEST_DATABASE_URL,
};
