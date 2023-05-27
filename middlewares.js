const JWT = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const secret = process.env.JWT_SECRET;

const verifyUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      res.status(400).json({ error: 'No token' });
      return;
    }

    // sent authorization header is in the format: 'Bearer token'
    const token = await req.headers.authorization.slice(
      7,
      req.headers.authorization.length
    );
    const decodedToken = JWT.verify(token, secret);

    if (Date.now() > decodedToken.exp * 1000) {
      res.status(401).json({ error: 'token expired, please login again' });
      return;
    }
    res.locals.decodedToken = decodedToken;
    res.locals.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
module.exports = verifyUser;
