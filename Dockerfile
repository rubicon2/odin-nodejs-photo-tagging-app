FROM node:22-alpine AS base
WORKDIR /usr/local/app

# This env var is necessary for the client to be built - the value gets baked in.
# Docker compose envs are not in existence when this image is getting built.
ARG VITE_IS_ADMIN
ARG VITE_SERVER_URL

COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build

# Migrate has to be part of start up command. Since in docker compose this service will
# depend on the db service, we can be sure it will be running when npm run migrate happens.
CMD ["sh", "-c", "npm run migrate && npm run start"]
