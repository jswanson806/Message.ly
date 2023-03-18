/** User class for message.ly */

const { DB_URI, BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPw, first_name, last_name, phone]);

      if(result.rows.length === 0) {
        throw new ExpressError(`Internal server error`, 400)
      }
    
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
      // query the username and password from db
      const result = await db.query(`
      SELECT username, password
      FROM users
      WHERE username = $1`,
      [username]);

      // handle missing username in db
      if(result.rows.length === 0) {
        throw new ExpressError(`Cannot find user ${username}`, 400)
      }

      const user = result.rows[0];
      // check for the user to have been found
      if(user){
        // compare password and user.password
        if(await bcrypt.compare(password, user.password)) {
          // if true, sign and return true, otherwise return false
          let token = jwt.sign({ username }, SECRET_KEY);
          return token;
        }
          return false;
      }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(`
      UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`, 
      [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    // query all users
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users`
    )
  
    // return array of users
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
      // query db for user
      const result = await db.query(`
        SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`,
        [username]);

      // handle missing user
      if(result.rows.length === 0) {
        throw new ExpressError(`Cannot find user ${username}`, 400)
      }
      // return the user
      return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
      // query messages from username
      const result = await db.query(`
        SELECT m.id,
          m.to_username,
          u.first_name,
          u.last_name,
          u.phone,
          m.body,
          m.sent_at,
          m.read_at
        FROM messages AS m
          JOIN users AS u ON m.to_username = u.username
        WHERE from_username = $1`,
      [username]);

      if(result.rows.length === 0) {
        throw new ExpressError(`Cannot find messages from ${username}`, 404);
      }
      
      return result.rows.map(m => ({
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at
      }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    // query messages from username
    const result = await db.query(
        `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
        [username]);

    // handle not finding any messages
    if(result.rows.length === 0) {
      throw new ExpressError(`Cannot find messages from ${username}`, 404);
    }

    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
}
}


module.exports = User;