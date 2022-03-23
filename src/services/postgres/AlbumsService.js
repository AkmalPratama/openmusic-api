const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({name, year}) {
        const id = nanoid(16);
        const q = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year]
        };
        const result = await this._pool.query(q);

        if (!result.rows[0].id) {
            throw new InvariantError('Fail to add Album');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const q = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id]
        };
        const result = await this._pool.query(q);

        if (!result.rows.length) {
            throw new NotFoundError('Fail to find album');
        }

        return result.rows[0];
    }

    async editAlbumById(id, {name, year}) {
        const q = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        };
        const result = await this._pool.query(q);

        if (!result.rows.length) {
            throw new NotFoundError('Fail to update album. Id not found');
        }
    }

    async deleteAlbumById(id) {
        const q = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id]
        };
        const result = await this._pool.query(q);

        if (!result.rows.length) {
            throw new NotFoundError('Fail to delete album. Id not found');
        }
    }
}

module.exports = AlbumsService;
