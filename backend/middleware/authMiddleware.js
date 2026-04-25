// authMiddleware.js — verifies JWT token on protected routes

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Token comes in the Authorization header as: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret — throws if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request object
    // Any route that runs after this middleware can access req.user
    req.user = decoded;

    next(); // continue to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = { protect };