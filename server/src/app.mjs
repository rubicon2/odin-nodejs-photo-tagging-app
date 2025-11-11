import loadEnv from './env.mjs';
import api from './routers/api.mjs';

import express from 'express';
import cors from 'cors';
import path from 'path';

loadEnv();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, '../public')));
app.use('/data', express.static(process.env.VOLUME_MOUNT_PATH));

const whitelist = JSON.parse(process.env.SERVER_CORS_WHITELIST);
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
  return res.status(500).send({
    status: 'error',
    data: {
      message: error.message,
    },
  });
});

export default app;
