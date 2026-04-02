const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var must be set');
if (!process.env.ADMIN_USERNAME) throw new Error('ADMIN_USERNAME env var must be set');
if (!process.env.ADMIN_PASSWORD_HASH) throw new Error('ADMIN_PASSWORD_HASH env var must be set');

const adminLogin = async (username, password) => {
  if (username.toLowerCase() !== process.env.ADMIN_USERNAME.toLowerCase()) {
    throw new Error('Invalid credentials');
  }
  const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
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