import multer from 'multer';
import 'dotenv/config';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.RAILWAY_VOLUME_MOUNT_PATH + '/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
