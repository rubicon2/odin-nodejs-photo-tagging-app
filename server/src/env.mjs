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

console.log('ENVIRONMENT LOADED');
console.log('                     MODE:', MODE);
console.log('          VITE_SERVER_URL:', VITE_SERVER_URL);
console.log('            VITE_IS_ADMIN:', VITE_IS_ADMIN);
console.log('              SERVER_PORT:', SERVER_PORT);
console.log('    SERVER_CORS_WHITELIST:', SERVER_CORS_WHITELIST);
console.log('      SERVER_DATABASE_URL:', SERVER_DATABASE_URL);
console.log('RAILWAY_VOLUME_MOUNT_PATH:', RAILWAY_VOLUME_MOUNT_PATH);

// So if we forget to add .env vars and e.g. deploy fails, we will have useful errors.
function checkEnvComplete() {
  let errorMsg = '';
  if (MODE === undefined) {
    errorMsg +=
      '\nMODE not defined in .env!\nShould be "development" or "production".\n';
  }
  if (VITE_SERVER_URL === undefined) {
    errorMsg +=
      '\nVITE_SERVER_URL not defined in .env!\nInclude protocol and port.\n';
  }
  if (VITE_IS_ADMIN === undefined) {
    errorMsg +=
      '\nVITE_IS_ADMIN not defined in .env!\nShould be true or false.\n';
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
  if (RAILWAY_VOLUME_MOUNT_PATH === undefined) {
    errorMsg += '\nRAILWAY_VOLUME_MOUNT_PATH not defined in .env!';
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
};
