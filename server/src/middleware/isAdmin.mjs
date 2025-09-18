export default function isAdmin(req, res, next) {
  if (process.env.VITE_IS_ADMIN === 'true') {
    return next();
  }
  return res.sendStatus(403);
}
