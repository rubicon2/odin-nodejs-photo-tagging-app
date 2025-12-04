FROM node:22-alpine AS base
WORKDIR /usr/local/app

# This env var is necessary for the client to be built - the value gets baked in.
# Docker compose envs are not in existence when this image is getting built.
ARG VITE_SERVER_URL

COPY . .
RUN npm install --global pnpm
RUN pnpm install
RUN npx prisma generate
RUN pnpm run build

# Migrate has to be part of start up command. Since in docker compose this service will
# depend on the db service, we can be sure it will be running when npm run migrate happens.
CMD ["sh", "-c", "pnpm run migrate && pnpm run start"]
