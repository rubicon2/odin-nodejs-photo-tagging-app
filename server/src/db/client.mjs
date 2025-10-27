import { PrismaClient } from '../generated/prisma/client.js';

const client = new PrismaClient({
  datasourceUrl: process.env.SERVER_DATABASE_URL,
});

export default client;
