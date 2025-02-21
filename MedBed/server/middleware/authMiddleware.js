// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'MISSING_TOKEN',
      message: 'Authorization header required',
    });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const errors = {
        TokenExpiredError: { code: 'TOKEN_EXPIRED', status: 401 },
        JsonWebTokenError: { code: 'INVALID_TOKEN', status: 403 },
        default: { code: 'AUTH_ERROR', status: 500 },
      };
      const { code, status } = errors[err.name] || errors.default;
      return res.status(status).json({ success: false, code, message: err.message });
    }
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  });
};
