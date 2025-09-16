#!/usr/bin/env bash

# Double quotes necessary in case file paths have spaces or special characters.
# This stops the special characters being interpreted as such by the shell.
# Move into directory containing this file and then pwd to get absolute path.
DIR="$(cd "$(dirname "${0}")" && pwd)"
echo "Scripts located at "${DIR}""

# Override value in .env so prisma migrate and client uses this instead.
export SERVER_DATABASE_URL="postgres://postgres:postgres@localhost:5433/test"

echo "Test database url: ${SERVER_DATABASE_URL}"

echo "Starting docker container..."

docker-compose up -d
echo "Waiting for the database to be ready..."

# Wait until database is up and running before trying to run prisma migration.
# Need to do docker-compose exec which runs a command against containerized service.
# The SELECT query only works once the db is running, even though "SELECT 1" does not actually hit the db.
"${DIR}"/wait-until.sh "docker-compose exec -T db psql -d test -c 'SELECT 1'" 10

if [ $? -eq 0 ]; then
  echo "Database ready"
  echo "Running prisma migrate dev..."
  npx prisma migrate dev

  # Check whether prisma migration was successful or not.
  if [ $? -eq 0 ]; then
    echo "Prisma migration finished"
    echo "Running integration tests..."
    # Script will be run from package scripts so root will be /odin-nodejs-photo-tagging-app. 
    vitest -c ./vitest.int.config.js
  else
    echo "Prisma migration failed. Tests cancelled"
  fi
else
  echo "Database timed out. Migration and tests cancelled"
fi
