const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist(name, owner) {
    const id = `playlists-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(q);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add playlist');
    }

    return result.rows[0].id;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_songs-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(q);
    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add song to playlist');
    }
  }

  async getPlaylists(owner) {
    const q = {
      text: `SELECT playlists.id as id, playlists.name as name, users.username as username
      FROM playlists LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(q);
    return result.rows;
  }

  async getPlaylistSongs(id) {
    const q = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists INNER JOIN users
      ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to find playlist');
    }
    const playlist = result.rows[0];

    const q2 = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs INNER JOIN playlist_songs
      ON songs.id = playlist_songs.song_id
      WHERE playlist_id = $1`,
      values: [id],
    };
    const result2 = await this._pool.query(q2);

    if (result2.rows.length) {
      playlist.songs = result2.rows;
    }

    return playlist;
  }

  async getPlaylistActivities(id) {
    const q = {
      text: `SELECT users.username, songs.title, activities.action, activities.time FROM activities
      INNER JOIN users ON activities.user_id = users.id
      INNER JOIN songs ON activities.song_id = songs.id
      WHERE activities.playlist_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(q);
    return result.rows;
  }

  async deletePlaylist(id) {
    const q = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rowCount) {
      throw new NotFoundError('Fail to delete playlist. Id not found');
    }
  }

  async deleteSongFromPlaylist(songId) {
    const q = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1',
      values: [songId],
    };
    const result = await this._pool.query(q);

    if (!result.rowCount) {
      throw new NotFoundError('Fail to delete song. Id not found');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const q = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(q);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found');
    }
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('You have no access to this resource');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw e;
      }
      await this._collaborationService.verifyCollaborator(playlistId, userId);
    }
  }

  async logAddSongToPlaylist(playlistId, songId, userId) {
    const id = `activity-${nanoid(16)}`;
    const action = 'add';
    const time = new Date().toISOString();
    const q = {
      text: 'INSERT INTO activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this._pool.query(q);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to log activity');
    }

    return result.rows[0].id;
  }

  async logDeleteSongFromPlaylist(playlistId, songId, userId) {
    const id = `activity-${nanoid(16)}`;
    const action = 'delete';
    const time = new Date().toISOString();
    const q = {
      text: 'INSERT INTO activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this._pool.query(q);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to log activity');
    }
  }
}

module.exports = PlaylistsService;
