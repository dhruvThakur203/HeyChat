const jwt = require('jsonwebtoken');

function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
}

module.exports = generateToken;


