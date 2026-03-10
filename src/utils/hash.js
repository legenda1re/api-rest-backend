const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const hashToken = async (token) => {
  return bcrypt.hash(token, SALT_ROUNDS);
};

const compareToken = async (token, hashedToken) => {
  return bcrypt.compare(token, hashedToken);
};

module.exports = { hashPassword, comparePassword, hashToken, compareToken };
