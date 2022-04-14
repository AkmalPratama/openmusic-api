/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('albums', { coverurl: 'VARCHAR(255)' });
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', 'coverurl');
};
