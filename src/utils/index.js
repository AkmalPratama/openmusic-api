/* eslint-disable */

const mapDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapDBToModelAlbum = ({
  id,
  name,
  year,
  coverurl,
  songs,
}) => ({
  id,
  name,
  year,
  coverUrl: coverurl,
  songs,
});

const filterSongTitle = (song, title) => (
  song.title.toLowerCase().includes(title)
);

const filterSongPerformer = (song, performer) => (
  song.performer.toLowerCase().includes(performer)
);

module.exports = {
  mapDBToModel,
  mapDBToModelAlbum,
  filterSongTitle,
  filterSongPerformer,
};
