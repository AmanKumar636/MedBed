// ../utils/errorHandler.js
const handleError = (res, error, status = 500, message = 'Server Error') => {
  console.error(error);
  res.status(status).json({
    success: false,
    message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

module.exports = { handleError };
