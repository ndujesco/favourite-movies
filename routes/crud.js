const { Router } = require("express");
const { body } = require("express-validator");


const { getMovies, getEditMovie, postEditMovie, getSearchMovie, postSearchMovie, saveMovie, deleteMovie, home, getRandomMovies } = require("../controllers/crud");
const { isAuth } = require("../auth/is-auth");

const router = Router(); 
const addMovieValidator = [
    body("title", "It should not be empty")
        .isLength({min: 1})
];
const editMovieValidator = [
    body("rating")
        .custom((value) => {
            if(value >= 1 && value <= 10) {
                return true
            }
            throw new Error("Input a rating between 1 and 10")
        })
    
]

router.get("/", home)

router.get("/my-movies", isAuth, getMovies);

router.get("/random-user", getRandomMovies);

router.get("/search-movie", isAuth, getSearchMovie);

router.post("/search-movie", isAuth, addMovieValidator, postSearchMovie)

router.get("/save-movie", isAuth, saveMovie);

router.get("/edit", isAuth, getEditMovie);

router.post("/edit", isAuth, editMovieValidator, postEditMovie);

router.delete("/delete", isAuth, deleteMovie);




module.exports = router;
