const express = require("express");

const moviesControllers = require("../controllers/movies-controllers");

const router = express.Router();

router.get("/:mid", moviesControllers.getMovieById);

router.get("/search/:title", moviesControllers.getMoviesByTitle);

module.exports = router;
