import { SERVER_DATABASE_URL } from '../env.mjs';
import { PrismaClient } from '../generated/prisma/client.js';

const client = new PrismaClient({
  datasourceUrl: SERVER_DATABASE_URL,
});

export default client;
