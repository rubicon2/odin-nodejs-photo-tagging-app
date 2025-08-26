import { RAILWAY_VOLUME_MOUNT_PATH } from '../env.mjs';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RAILWAY_VOLUME_MOUNT_PATH + '/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
