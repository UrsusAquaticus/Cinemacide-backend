const axios = require("axios");

const HttpError = require("../models/http-error");

const API_KEY = process.env.MOVIE_API_KEY;
const API_HOST = "movie-database-imdb-alternative.p.rapidapi.com";

async function fetchMovieById(mid) {
	var options = {
		method: "GET",
		url: `https://${API_HOST}/`,
		params: { i: mid, r: "json" },
		headers: {
			"x-rapidapi-key": API_KEY,
			"x-rapidapi-host": API_HOST,
		},
	};

	const response = await axios.request(options);

	const data = response.data;

	if (!data || data.status === "ZERO_RESULTS") {
		const error = new HttpError(
			"Could not find location for the specified address.",
			422
		);
		throw error;
	}

	return data;
}

async function fetchMoviesByTitle(title) {
	var options = {
		method: "GET",
		url: `https://${API_HOST}/`,
		params: { s: title, page: "1", r: "json" },
		headers: {
			"x-rapidapi-key": API_KEY,
			"x-rapidapi-host": API_HOST,
		},
	};

	const response = await axios.request(options);

	const data = response.data;

	if (!data || data.status === "ZERO_RESULTS") {
		const error = new HttpError(
			"Could not find location for the specified address.",
			422
		);
		throw error;
	}

	//returns
	return data;
}

exports.fetchMovieById = fetchMovieById;
exports.fetchMoviesByTitle = fetchMoviesByTitle;
