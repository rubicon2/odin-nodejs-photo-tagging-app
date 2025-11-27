import loadEnv from './env.mjs';
import api from './routers/api.mjs';

import express from 'express';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import client from './db/client.mjs';
import cors from 'cors';
import path from 'path';

loadEnv();

const app = express();

// Populate request body.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS.
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
    credentials: true,
  }),
);

// Client sessions.
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.MODE === 'production' ? true : '',
      sameSite: 'strict',
      // Expires in 1 month.
      maxAge: 1000 * 60 * 60 * 24 * 28,
    },
    store: new PrismaSessionStore(client, {
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
      // Check every 10 minutes.
      checkPeriod: 1000 * 60 * 10,
    }),
  }),
);

// Manually send index.html so that cookie will be set in response headers.
// If index is served automatically from static directory, cookie will not be set
// until an api route is used.
app.get('/', (req, res) => {
  return res.sendFile(path.join(import.meta.dirname, '../public/index.html'));
});

// These need to be after the get index route but before the api router.
app.use(express.static(path.join(import.meta.dirname, '../public')));
app.use('/data', express.static(process.env.VOLUME_MOUNT_PATH));

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
