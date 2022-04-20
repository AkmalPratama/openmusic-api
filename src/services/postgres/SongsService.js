const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { filterSongTitle, filterSongPerformer, mapDBToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(q);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add song');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    const songs = result.rows;
    let filteredSong = songs;
    if (performer !== undefined) {
      filteredSong = filteredSong.filter((song) => filterSongPerformer(song, performer));
    }
    if (title !== undefined) {
      filteredSong = filteredSong.filter((song) => filterSongTitle(song, title));
    }
    return filteredSong;
  }

  async getSongById(id) {
    try {
      const result = await this._cacheService.get(`song:${id}`);
      return { song: JSON.parse(result), isCache: true };
    } catch (e) {
      const q = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(q);
      if (!result.rows.length) {
        throw new NotFoundError('Fail to find song');
      }
      await this._cacheService.set(`song:${id}`, JSON.stringify(result.rows.map(mapDBToModel)[0]));
      return { song: result.rows.map(mapDBToModel)[0], isCache: false };
    }
  }

  async editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const q = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to update song. Id not found');
    }
    await this._cacheService.delete(`song:${id}`);
  }

  async deleteSongById(id) {
    const q = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to delete song. Id not found');
    }
    await this._cacheService.delete(`song:${id}`);
  }
}

module.exports = SongsService;
