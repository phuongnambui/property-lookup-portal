const bcrypt = require('bcrypt');
const crypto = require('crypto');

// In-memory admin sessions
let adminSessions = [];

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'Tnguyen0913@gmail.com',
  passwordHash: '$2b$10$O7CRsCbyQNiOnUAp21lk7ucbep0Kme3qfTD7.Bjn9jdOVF5afF2Pi'
};

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate session token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Admin login
const adminLogin = async (username, password) => {
  if (username !== ADMIN_CREDENTIALS.username) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, ADMIN_CREDENTIALS.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken();
  adminSessions.push({
    token,
    username,
    createdAt: Date.now()
  });

  return { token };
};

// Verify admin token
const verifyAdminToken = (token) => {
  const session = adminSessions.find(s => s.token === token);
  if (!session) {
    throw new Error('Invalid or expired token');
  }
  return true;
};

// Admin logout
const adminLogout = (token) => {
  adminSessions = adminSessions.filter(s => s.token !== token);
  return {};
};

module.exports = {
  hashPassword,
  adminLogin,
  verifyAdminToken,
  adminLogout
};