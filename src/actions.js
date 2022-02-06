const db = require('./db');

module.exports = {
  getAllUsers: async () => {
    const { rows } = await db.query(db.GET_ALL_USERS);
    return rows;
  },
  deleteUser: async id => {
    await db.query(db.DELETE_USER, [id]);
  },
  findByEmail: async email => {
    const { rows } = await db.query(db.FIND_USER_BY_EMAIL, [email]);
    return rows[0];
  },
  findByUsername: async username => {
    const { rows } = await db.query(db.FIND_USER_BY_USERNAME, [username]);
    return rows[0];
  },
  addUser: async (username, email, password) => {
    await db.query(db.ADD_USER, [username, email, password]);
  },
}