const crypto = require('crypto');
const JWT = require('jsonwebtoken');

const passwordGenerator = (passwordLength) => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';
  for (let i = 0; i <= passwordLength; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

const tokenGenerator = (secret, expiresIn, userId) => {
  return JWT.sign({ userId }, secret, { expiresIn });
};

module.exports = { passwordGenerator, tokenGenerator };
