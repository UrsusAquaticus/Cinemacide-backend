const express = require("express");
const checkApi = require("../middleware/check-api");

const moviesControllers = require("../controllers/movies-controllers");

const router = express.Router();

//Check api limit is not exceeded
router.use(checkApi);

router.get("/:mid", moviesControllers.getMovieById);

router.get("/search/:title", moviesControllers.getMoviesByTitle);

module.exports = router;
