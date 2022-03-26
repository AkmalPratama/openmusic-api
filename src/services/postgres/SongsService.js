const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { filterSongTitle, filterSongPerformer, mapDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
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
    const q = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to find song');
    }

    return result.rows.map(mapDBToModel)[0];
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
  }
}

module.exports = SongsService;
