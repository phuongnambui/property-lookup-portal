const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ADMIN_CREDENTIALS = {
  username: 'tnguyen0193@gmail.com',
  passwordHash: '$2b$10$O7CRsCbyQNiOnUAp21lk7ucbep0Kme3qfTD7.Bjn9jdOVF5afF2Pi'
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const adminLogin = async (username, password) => {
  if (username.toLowerCase() !== ADMIN_CREDENTIALS.username.toLowerCase()) {
    throw new Error('Invalid credentials');
  }
  const isValid = await verifyPassword(password, ADMIN_CREDENTIALS.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  return { token };
};

const verifyAdminToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  adminLogin,
  verifyAdminToken,
};