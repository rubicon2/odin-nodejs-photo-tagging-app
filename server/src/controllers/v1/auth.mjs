import { validationResult, matchedData } from 'express-validator';

function postEnableAdminMode(req, res) {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.status(401).json({
      status: 'fail',
      data: {
        validation,
      },
    });
  }

  const { password } = matchedData(req);

  if (
    // If admin_mode is already enabled, just skip the rest of the function.
    process.env.ADMIN_ENABLED === 'true' ||
    password === process.env.ADMIN_PASSWORD
  ) {
    process.env.ADMIN_ENABLED = 'true';
    return res.json({
      status: 'success',
      data: {
        message: 'Admin mode enabled.',
      },
    });
  }

  return res.status(401).json({
    status: 'fail',
    data: {
      message: 'Incorrect password.',
    },
  });
}

function postDisableAdminMode(req, res) {
  process.env.ADMIN_ENABLED = false;
  return res.json({
    status: 'success',
    data: {
      message: 'Admin mode disabled.',
    },
  });
}

export { postEnableAdminMode, postDisableAdminMode };
