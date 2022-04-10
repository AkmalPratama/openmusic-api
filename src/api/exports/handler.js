const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }

  async postExportSongsHandler(request, h) {
    try {
      this._validator.validateExportSongsPayload(request.payload);

      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };
      await this._service.sendMessage('export:songs', JSON.stringify(message));
      const response = h.response({
        status: 'success',
        message: 'Your request is being processed',
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
      console.error(e);
      return response;
    }
  }
}

module.exports = ExportsHandler;
