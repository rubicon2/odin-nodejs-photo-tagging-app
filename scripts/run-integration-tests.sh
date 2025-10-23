#!/usr/bin/env bash

docker_down() {
  echo "Shutting down docker containers..."
  # -v removes volumes.
  docker-compose down -v
  echo "Docker containers shut down"

  echo "Pruning docker cache..."
  docker system prune -f
  echo "Pruned"
}

# So that if terminal is running within another program that closes, will still clean up.
trap docker_down SIGHUP

echo "Starting docker containers..."

# Start test database and containerized backend for storing uploads.
# Now backend is containerized, once it runs CMD the prisma migration will happen, then the tests will run.
docker-compose up --build --watch

# Once script fails or tests are finished, destroy container and volumes.
docker_down

echo "Exiting run-integration-tests.sh..."
