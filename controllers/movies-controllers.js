const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const {
	fetchMovieById,
	fetchMoviesByTitle,
} = require("../util/movie-database");

const getMovieById = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Api request limit exceeded.", 429)
		);
	}

	const movieId = req.params.mid;

	let movie;
	try {
		movie = await fetchMovieById(movieId);
	} catch (error) {
		return next(error);
	}

	if (!movie) {
		return next(
			new HttpError("Could not find movie for the provided movie id.", 404)
		);
	}

	res.json({ movie });
};

const getMoviesByTitle = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Api request limit exceeded.", 422)
		);
	}

	const movieTitle = req.params.title;

	let movie;
	try {
		movie = await fetchMoviesByTitle(movieTitle);
	} catch (error) {
		return next(error);
	}

	if (!movie) {
		return next(new HttpError("Something went wrong", 404));
	}

	res.json({ movie });
};

exports.getMovieById = getMovieById;
exports.getMoviesByTitle = getMoviesByTitle;
