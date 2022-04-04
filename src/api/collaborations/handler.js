const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(service, playlistsService, usersService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);       
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validatePostCollaborationPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._usersService.getUserById(userId);

      const collaborationId = await this._service.addCollaboration(playlistId, userId);
      const response = h.response({
        status: 'success',
        data: { collaborationId },
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

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateDeleteCollaborationPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deleteCollaboration(playlistId, userId);
      const response = h.response({
        status: 'success',
        message: 'Deleted collaborator successfully',
      });
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

module.exports = CollaborationsHandler;
