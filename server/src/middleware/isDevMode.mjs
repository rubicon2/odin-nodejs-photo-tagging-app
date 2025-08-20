export default function isDevMode(req, res, next) {
  if (process.env.MODE === 'development') {
    return next();
  }
  throw new Error('Can only access this route in development mode');
}
