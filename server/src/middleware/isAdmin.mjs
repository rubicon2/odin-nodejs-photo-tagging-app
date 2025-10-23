export default function isAdmin(req, res, next) {
  if (process.env.ADMIN_ENABLED === 'true') {
    return next();
  }
  return res.sendStatus(403);
}
