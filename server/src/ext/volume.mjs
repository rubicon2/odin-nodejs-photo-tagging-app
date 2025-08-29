import { RAILWAY_VOLUME_MOUNT_PATH } from '../env.mjs';
import fs from 'node:fs/promises';
import path from 'path';

async function deleteFile(filepath) {
  const absPath = path.join(RAILWAY_VOLUME_MOUNT_PATH, filepath);
  await fs.rm(absPath);
}

export { deleteFile };
