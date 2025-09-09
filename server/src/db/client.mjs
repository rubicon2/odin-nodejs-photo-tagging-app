import {
  MODE,
  SERVER_DATABASE_URL,
  SERVER_TEST_DATABASE_URL,
} from '../env.mjs';
import { PrismaClient } from '../generated/prisma/client.js';

const client = new PrismaClient({
  datasourceUrl:
    MODE === 'testing' ? SERVER_TEST_DATABASE_URL : SERVER_DATABASE_URL,
});

export default client;
