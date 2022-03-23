const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async postAlbumHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const {name, year} = request.payload;
            const albumId = await this._service.addAlbum({name, year});
            const response = h.response({
                status: 'success',
                data: {
                    albumId
                }
            });
            response.code(201);
            return response;
        } catch (e) {
            if (e instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: e.message
                });
                response.code(e.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Error on server'
            });
            response.code(500);
            console.error(e);
            return response;
        }
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const {id} = request.params;
            const album = await this._service.getAlbumById(id);
            return {
                status: 'success',
                data: {
                    album
                }
            };
        } catch (e) {
            if (e instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: e.message
                });
                response.code(e.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Error on server'
            });
            response.code(500);
            console.error(e);
            return response;
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const {id} = request.params;
            await this._service.editAlbumById(id, request.payload);
            return {
                status: 'success',
                message: 'Album updated successfully'
            };
        } catch (e) {
            if (e instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: e.message
                });
                response.code(e.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Error on server'
            });
            response.code(500);
            console.error(e);
            return response;
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const {id} = request.params;
            await this._service.deleteAlbumById(id);

            return {
                status: 'success',
                message: 'Album deleted successfully'
            };
        } catch (e) {
            if (e instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: e.message
                });
                response.code(e.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Error on server'
            });
            response.code(500);
            console.error(e);
            return response;
        }
    }
}

module.exports = AlbumsHandler;
