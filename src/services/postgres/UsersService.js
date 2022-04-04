const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({
    username,
    password,
    fullname
  }) {
    await this.verifyUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const q = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    const result = await this._pool.query(q);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add user');
    }

    return result.rows[0].id;
  }

  async verifyUsername(username) {
    const q = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(q);
    if (result.rows.length > 0) {
      throw new InvariantError('Fail to add user. Username already taken');
    }
  }

  async verifyUserCredential(username, password) {
    const q = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(q);
    if (!result.rows.length) {
      throw new AuthenticationError('Invalid credential');
    }
    const { id, password: hashedPassword} = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Invalid credential');
    }
    return id;
  }

  async getUserById(userId) {
    const q = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };
    const result = await this._pool.query(q);
    if (!result.rows.length) {
      throw new NotFoundError('Invalid credential');
    }
  }
}

module.exports = UsersService;
