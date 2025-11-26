export default function isAdmin(req, res, next) {
  if (req.session?.admin === true) {
    return next();
  }
  return res.status(403).json({
    status: 'fail',
    data: {
      message: 'Admin mode is not enabled.',
    },
  });
}
