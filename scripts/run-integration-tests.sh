#!/usr/bin/env bash

echo "Starting docker containers..."

# Start test database and containerized backend for storing uploads.
# Now backend is containerized, once it runs CMD the prisma migration will happen, then the tests will run.
docker-compose up --build --watch

# Once script fails or tests are finished, destroy container and volumes.
echo "Shutting down docker containers..."

# -v removes volumes.
docker-compose down -v

echo "Docker containers shut down"
