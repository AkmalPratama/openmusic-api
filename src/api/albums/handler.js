const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(albumsService, storageService, likeService, validator, uploadValidator) {
    this._service = albumsService;
    this._storageService = storageService;
    this._likeService = likeService;
    this._validator = validator;
    this._uploadValidator = uploadValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this);

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikeHandler = this.getAlbumLikeHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._service.addAlbum({ name, year });
      const response = h.response({
        status: 'success',
        data: { albumId },
      });
      response.code(201);
      return response;
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);
      return response;
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);
      const response = h.response({
        status: 'success',
        data: { album },
      });
      return response;
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);

      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      await this._service.editAlbumById(id, request.payload);
      return {
        status: 'success',
        message: 'Album updated successfully',
      };
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);

      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album deleted successfully',
      };
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);

      return response;
    }
  }

  async postAlbumCoverByIdHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id } = request.params;

      this._uploadValidator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const path = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;
      await this._service.updateAlbumCover(id, path);

      const response = h.response({
        status: 'success',
        message: 'Cover uploaded successfully',
      });
      response.code(201);
      return response;
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);

      return response;
    }
  }

  async postAlbumLikeHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.getAlbumById(id);
      await this._likeService.setAlbumLike(credentialId, id);

      const response = h.response({
        status: 'success',
        message: 'Album liked successfully',
      });
      response.code(201);
      return response;
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);

      return response;
    }
  }

  async getAlbumLikeHandler(request, h) {
    try {
      const { id } = request.params;
      const { like, isCache } = await this._likeService.getAlbumLike(id);
      const response = h.response({
        status: 'success',
        data: {
          likes: like,
        },
      });
      if (isCache) {
        response.header('X-Data-Source', 'cache');
      }
      response.code(200);

      return response;
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Error on server',
      });
      response.code(500);

      return response;
    }
  }
}

module.exports = AlbumsHandler;
