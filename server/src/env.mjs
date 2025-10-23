import dotenv from 'dotenv';
import path from 'path';

// So if we forget to add .env vars and e.g. deploy fails, we will have useful errors.
function checkEnvComplete() {
  const {
    MODE,
    VITE_SERVER_URL,
    ADMIN_PASSWORD,
    SERVER_PORT,
    SERVER_CORS_WHITELIST,
    SERVER_DATABASE_URL,
    VOLUME_MOUNT_PATH,
  } = process.env;

  let errorMsg = '';
  if (MODE === undefined) {
    errorMsg +=
      '\nMODE not defined in .env!\nShould be "development" or "production".\n';
  }
  if (VITE_SERVER_URL === undefined) {
    errorMsg +=
      '\nVITE_SERVER_URL not defined in .env!\nInclude protocol and port.\n';
  }
  if (ADMIN_PASSWORD === undefined) {
    errorMsg += '\nADMIN_PASSWORD not defined in .env!\n';
  }
  if (SERVER_PORT === undefined) {
    errorMsg += '\nSERVER_PORT not defined in .env!\n';
  }
  if (SERVER_CORS_WHITELIST === undefined) {
    errorMsg +=
      '\nSERVER_CORS_WHITELIST not defined in .env!\nShould be a JSON array.\n';
  }
  if (SERVER_DATABASE_URL === undefined) {
    errorMsg += '\nSERVER_DATABASE_URL not defined in .env!';
  }
  if (VOLUME_MOUNT_PATH === undefined) {
    errorMsg += '\nVOLUME_MOUNT_PATH not defined in .env!';
  }

  if (errorMsg.length !== 0) throw new Error(errorMsg);
}

function loadEnv() {
  dotenv.config({
    path: path.join(import.meta.dirname, '../../.env'),
  });

  checkEnvComplete();
}

export default loadEnv;
