import fs from 'node:fs/promises';
import path from 'path';

async function deleteFile(filepath) {
  const absPath = path.join(process.env.VOLUME_MOUNT_PATH, filepath);
  await fs.rm(absPath);
}

export { deleteFile };
