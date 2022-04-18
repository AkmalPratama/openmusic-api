const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    albumsService,
    storageService,
    likeService,
    validator,
    uploadValidator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      likeService,
      validator,
      uploadValidator,
    );
    server.route(routes(albumsHandler));
  },
};
