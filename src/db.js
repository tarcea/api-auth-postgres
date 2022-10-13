const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
pool.connect();

module.exports = {
  query: async (text, params) => pool.query(text, params),
  GET_ALL_USERS: "SELECT id, username, email FROM users",
  ADD_USER: `
  INSERT INTO users (username, email, password)
  VALUES ($1, $2, $3)
  `,
  DELETE_USER: `DELETE FROM users WHERE id = $1`,
  FIND_USER_BY_EMAIL: `SELECT * FROM users WHERE email = $1`,
  FIND_USER_BY_USERNAME: `SELECT * FROM users WHERE username = $1`,
  FIND_USER_BY_ID: `SELECT * FROM users WHERE id = $1`,
  CHANGE_PASSWORD: `
    UPDATE users
    SET password = $1
    WHERE id = $2
  `,
};
