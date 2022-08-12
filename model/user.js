const { Schema, default: mongoose } = require("mongoose");

const moviesSchema = new Schema({
  movieId: String,
  title: String,
  year: String,
  description: String,
  imageUrl: String,
  rating: Number,
  review: String,
});

const userSchema = new Schema({
  email: String,
  name: String,
  password: String,
  movies: [moviesSchema],
});

userSchema.methods.editMovie = function(movieId, rating, review) {
  const movieIndex = this.movies.findIndex(movie => movie.movieId.toString() === movieId.toString())
  this.movies[movieIndex].rating = rating;
  this.movies[movieIndex].review = review;
  return this.save()
}



module.exports = mongoose.model("User", userSchema);
