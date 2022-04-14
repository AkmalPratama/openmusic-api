const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    albumsService,
    storageService,
    validator,
    uploadValidator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      validator,
      uploadValidator,
    );
    server.route(routes(albumsHandler));
  },
};
