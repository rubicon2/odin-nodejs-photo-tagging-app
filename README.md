# Full Stack Project Template

Set up with express server and vite client as separate npm packages in their own sub-directories. Should be ready to run and test.

## Package Scripts

There are scripts on the root package for dev servers, testing and deployment. Due to the name, I thought that vitest was only suitable for testing vite, but actually it can be used as a drop-in replacement for jest, and I will use it as such in all future projects. It is a lot easier to use, especially since it supports es6 imports/exports. Jest doesn't, and you have to run node with a flag for "experimental-vm-modules" or something. Not intuitive. Vitest just works.

Unit tests are run with the following command:

```bash
npm run test:unit
```

Integration tests are located in tests/ and requires docker installed to run, as it spins up a fresh instance of a postgresql database for testing. The shell scripts located in scripts/ exist for this purpose and require execute permissions so you will need to run from the root directory to allow them to run:

```bash
chmod +x ./scripts/*
```

And the tests are run with the following command:

```bash
npm run test:int
```

### Scripts List

- npm run dev (starts express server on SERVER_PORT and vite client on port 5173)
- npm run build (builds vite client and copies it into the server public folder, ready to be served)
- npm run start (starts express server on SERVER_PORT)
- npm run test:unit (runs unit tests)
- npm run test:int (runs integration tests, as detailed above)

## Env Requirements

- MODE (i.e. production or development)
- VITE_IS_ADMIN (whether the application should be running in admin mode or not. Admin mode will be used to upload and set up photos and their tags, and once done the this will be changed to FALSE.)
- VITE_SERVER_URL (so vite client is able to make calls to the server)
- SERVER_PORT (tells the server which port to listen on)
- SERVER_CORS_WHITELIST (as a JSON array, like so: '["https://duckduckgo.com", "https://wikipedia.org"]', and yes it has to be single quotes around the array otherwise it won't load)
- SERVER_DATABASE_URL (exactly as it sounds)
- RAILWAY_VOLUME_MOUNT_PATH (the directory to which uploaded files will be saved)
