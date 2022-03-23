require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

const init = async () => {
    const albumsService = new AlbumsService();
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
    });

    await server.register({
        plugin: albums,
        options: {
            service: albumsService,
            validator: AlbumsValidator
        }
    });

    await server.start();

    console.log(`Server run at ${server.info.uri}`);

};

init();
