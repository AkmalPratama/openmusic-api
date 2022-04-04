const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new InvariantError('Fail to add collaborator');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const q = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 returning id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to delete collaborator. Data not found');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const q = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new AuthorizationError('You have no access to this resource');
    }
  }
}

module.exports = CollaborationsService;
