import api from './routers/api.mjs';
import { RAILWAY_VOLUME_MOUNT_PATH, SERVER_CORS_WHITELIST } from './env.mjs';

import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(import.meta.dirname, '../public')));
app.use('/data', express.static(RAILWAY_VOLUME_MOUNT_PATH));

const whitelist = JSON.parse(SERVER_CORS_WHITELIST);
console.log('CORS whitelist:', whitelist);
app.use(
  cors({
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        console.log(`Allowed by CORS - request from ${origin}`);
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS - request from ${origin}`));
      }
    },
  }),
);

// Put routers and stuff here.
app.use('/api', api);

// Error handling route.
/* eslint-disable-next-line */
app.use((error, req, res, next) => {
  console.error(error);
  return res.send({
    status: 'error',
    data: {
      message: error.message,
    },
  });
});

export default app;
