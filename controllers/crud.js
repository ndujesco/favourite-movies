const { validationResult } = require("express-validator");
const _ = require("lodash");

const User = require("../model/user");
const { searchMovieApi, getDetailsApi } = require("../tmdb/tmdb");

exports.home = (req, res) => {
  res.render("home");
};

exports.getMovies = async (req, res) => {
  const findMoviesOnly = await User.findById(req.user._id).select({
    _id: 0,
    movies: 1,
  });
  const movieArray = _.sortBy(findMoviesOnly.movies, "rating");
  const sortedArray = movieArray.map((movie, index, array) => {
    return { ...movie._doc, ranking: array.length - index };
  });
  res.render("crud/index", {
    name: "my",
    user: "me",
    movies: sortedArray,
  });
};

exports.getSearchMovie = async (req, res) => {
  res.render("crud/search", {
    errorMessage: "",
  });
};

exports.postSearchMovie = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("crud/search", {
      errorMessage: errors.array()[0].msg,
    });
  }
  const { title } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect("/my-movies");
    }
    const allMoviesSearch = await searchMovieApi(title);
    req.session.allMoviesSearch = allMoviesSearch;
    req.session.save();
    return res.render("crud/select", {
      movies: allMoviesSearch,
      errorMessage: "",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.saveMovie = async (req, res) => {
  const { id } = req.query;
  try {
    const user = await User.findById(req.user._id);
    const movieDetails = await getDetailsApi(id);
    if (movieDetails && user) {
      const matchesOne = user.movies.some(
        (movie) => movie.movieId === movieDetails.movieId
      );
      if (matchesOne) {
        console.log(req.session.allMoviesSearch);
        return res.render("crud/select", {
          movies: req.session.allMoviesSearch,
          errorMessage: "You have this movie in your list",
        });
      }
      user.movies.push(movieDetails);
      await user.save();
      return res.redirect("/edit?movieId=" + id);
    }
    res.redirect("/my-movies");
  } catch (err) {
    console.log(err);
  }
};

exports.getEditMovie = async (req, res) => {
  const { movieId } = req.query;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect("/my-movies");
    }
    const movies = await user.movies;
    const movie = movies.filter((movie) => movie.movieId === movieId)[0];
    res.render("crud/edit", {
      errorMessage: "",
      title: movie.title,
      movieId: movie.movieId,
      oldValues: { rating: movie.rating, review: movie.review },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditMovie = async (req, res) => {
  const errors = validationResult(req);
  const rating = +req.body.rating;
  const { title, movieId, review } = req.body;
  if (!errors.isEmpty()) {
    return res.render("crud/edit", {
      errorMessage: errors.array()[0].msg,
      title,
      movieId,
      oldValues: { rating: rating || null, review }, // if I did not add "|| null" then rating would be zero if an empty string was posted (+"" =)
    });
  }
  try {
    const user = await User.findById(req.user._id);
    const update = user.editMovie(movieId, rating, review);
    res.redirect("/my-movies");
  } catch (err) {
    console.log(err);
  }
};

exports.deleteMovie = async (req, res) => {
  const { movieId } = req.query;
  const query = { _id: req.user._id };
  const update = { $pull: { movies: { movieId } } };
  await User.findOneAndUpdate(query, update);
  res.redirect("/my-movies");
};

exports.getRandomMovies = async (req, res) => {
  let filteredUsers;
  try {
    const users = await User.find();
    filteredUsers = await users.filter((user) => user.movies.length > 0);
    if (req.user) {
      filteredUsers = users.filter((user) => user.id !== req.user.id);
    }
    const randomUser = _.sample(filteredUsers);
    const movieArray = _.sortBy(randomUser.movies, "rating");
    const sortedArray = movieArray.map((movie, index, array) => {
      return { ...movie._doc, ranking: array.length - index };
    });
    res.render("crud/index", {
      name: randomUser.name + "'s",
      user: "random",
      movies: sortedArray,
    });
  } catch (err) {
    res.redirect("/");
  }
};
