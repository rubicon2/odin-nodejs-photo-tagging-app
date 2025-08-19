# Full Stack Project Template

Set up with express server and vite client as separate npm packages in their own sub-directories. Should be ready to run and test.

## Package Scripts

There are scripts on the root package for dev servers and deployment. There are different scripts for running tests on each package, as each uses different testing tools (the server is tested with jest and the vite client is tested with vitest).

### Main Package

- npm run dev (starts express server on SERVER_PORT and vite client on port 5173)
- npm run build (builds vite client and copies it into the server public folder, ready to be served)
- npm run start (starts express server on SERVER_PORT)

### Server Package

- npm run test
- npm run test:coverage

### Client Package

- npm run test
- npm run test:coverage

## Env Requirements

- MODE (i.e. production or development)
- SERVER_PORT (tells the server which port to listen on)
- SERVER_CORS_WHITELIST (as a JSON array, like so: '["https://duckduckgo.com", "https://wikipedia.org"]', and yes it has to be single quotes around the array otherwise it won't load)
- VITE_SERVER_URL (so vite client is able to make calls to the server)
