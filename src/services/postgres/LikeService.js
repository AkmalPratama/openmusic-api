const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class LikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async setAlbumLike(userid, albumid) {
    const q = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userid, albumid],
    };
    const result = await this._pool.query(q);
    if (result.rowCount) {
      const q2 = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
        values: [userid, albumid],
      };
      await this._pool.query(q2);
    } else {
      const id = `like-${nanoid(16)}`;
      const q2 = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
        values: [id, userid, albumid],
      };
      await this._pool.query(q2);
    }
    await this._cacheService.delete(`like:${albumid}`);
  }

  async getAlbumLike(id) {
    try {
      const result = await this._cacheService.get(`like:${id}`);
      return { like: Number(result), isCache: true };
    } catch (e) {
      const q = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };
      const result = await this._pool.query(q);
      await this._cacheService.set(`like:${id}`, result.rowCount);
      return { like: result.rowCount, isCache: false };
    }
  }
}

module.exports = LikeService;
