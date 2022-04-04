const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this._service = service;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistsHandler = this.postPlaylistsHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.getPlaylistActivities = this.getPlaylistActivities.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistsHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId} = request.auth.credentials;
      const playlistId = await this._service.addPlaylist(name, credentialId);
      const response = h.response({
        status: 'success',
        data: { playlistId },
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

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostPlaylistSongPayload(request.payload);

      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._songsService.getSongById(songId);
      await this._service.addSongToPlaylist(playlistId, songId);
      await this._service.logAddSongToPlaylist(playlistId, songId, credentialId);
      const response = h.response({
        status: 'success',
        message: 'Added song to playlist'
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

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId} = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      return {
        status: 'success',
        data: { playlists },
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

  async getPlaylistSongsHandler(request, h) {
    try {
      const {id: playlistId} = request.params;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const playlist = await this._service.getPlaylistSongs(playlistId, credentialId);
      return {
        status: 'success',
        data: { playlist },
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

  async getPlaylistActivities(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const result = await this._service.getPlaylistActivities(playlistId);
      return {
        status: 'success',
        data: {
          playlistId: playlistId,
          activities: result,
        }
      }
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

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylist(id);

      return {
        status: 'success',
        message: 'Playlists deleted successfully',
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

  async deletePlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostPlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._songsService.getSongById(songId);
      await this._service.deleteSongFromPlaylist(songId);
      await this._service.logDeleteSongFromPlaylist(playlistId, songId, credentialId);

      return {
        status: 'success',
        message: 'Playlists deleted successfully',
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
}

module.exports = PlaylistsHandler;
