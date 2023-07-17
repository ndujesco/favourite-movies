const axios = require("axios");

const MOVIE_URL = "https://api.themoviedb.org/3/search/movie/";
const apiKey = "4af8cd32e00afd6870e4087b2e2b0d16";
const SPECIFIC_URL = "https://api.themoviedb.org/3/movie/";
const BACKGROUND_IMAGE =
  "https://www.shortlist.com/media/images/2019/05/the-30-coolest-alternative-movie-posters-ever-2-1556670563-K61a-column-width-inline.jpg";

const searchMovieApi = async (movie) => {
  try {
    const params = {
      api_key: apiKey,
      query: movie,
      language: "en-US",
      include_adult: true,
    };
    const response = await axios.get(MOVIE_URL, { params });
    const movies = response.data.results;
    return movies;
  } catch (err) {
    console.log(err);
  }
};
exports.getDetailsApi = async (id) => {
  const params = { api_key: apiKey, language: "en-US" };
  try {
    const response = await axios.get(SPECIFIC_URL + id, { params });
    const movie = response.data;
    movie.imageUrl = movie.poster_path
      ? "https://image.tmdb.org/t/p/w500" + movie.poster_path
      : BACKGROUND_IMAGE;
    return {
      movieId: id,
      title: movie.title,
      year: movie.release_date.split("-")[0],
      description: movie.overview,
      imageUrl: movie.imageUrl,
    };
  } catch (err) {
    console.log(err);
  }
};

async function callOne(movie) {
  const res = await searchMovieApi(movie);
}

callOne("Avengers")