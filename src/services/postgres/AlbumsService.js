const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbum } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(q);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add Album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);
      return { album: JSON.parse(result), isCache: true };
    } catch (e) {
      const q = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(q);

      if (!result.rows.length) {
        throw new NotFoundError('Fail to find album');
      }

      const q2 = {
        text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
        values: [id],
      };
      const result2 = await this._pool.query(q2);

      if (result2.rows.length) {
        result.rows[0].songs = result2.rows;
      }

      await this._cacheService.set(`album:${id}`, JSON.stringify(result.rows.map(mapDBToModelAlbum)[0]));

      return { album: result.rows.map(mapDBToModelAlbum)[0], isCache: false };
    }
  }

  async editAlbumById(id, { name, year }) {
    const q = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to update album. Id not found');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async deleteAlbumById(id) {
    const q = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to delete album. Id not found');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async updateAlbumCover(id, path) {
    const q = {
      text: 'UPDATE albums SET coverurl = $1 WHERE id = $2',
      values: [path, id],
    };
    const result = await this._pool.query(q);
    if (!result.rowCount) {
      throw new NotFoundError('Fail to update cover album. Id not found');
    }
  }
}

module.exports = AlbumsService;
