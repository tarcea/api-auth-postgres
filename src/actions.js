const db = require('./db');

module.exports = {
  getAllUsers: async () => {
    const { rows } = await db.query(db.GET_ALL_USERS);
    return rows;
  },
  deleteUser: async id => {
    await db.query(db.DELETE_USER, [id])
  }
}