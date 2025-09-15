export default function isAdmin(req, res, next) {
  if (process.env.VITE_IS_ADMIN === 'true') {
    return next();
  }
  throw new Error('Can only access this route as admin');
}
