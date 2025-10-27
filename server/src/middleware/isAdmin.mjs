export default function isAdmin(req, res, next) {
  if (process.env.ADMIN_ENABLED === 'true') {
    return next();
  }
  return res.status(403).json({
    status: 'fail',
    data: {
      message: 'Admin mode is not enabled.',
    },
  });
}
