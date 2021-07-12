const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Review = require("../models/review");
const User = require("../models/user");

const getReviews = async (req, res, next) => {
	let reviews;
	try {
		reviews = (await Review.find()).reverse();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}
	res.json({
		reviews: reviews.map((review) => review.toObject({ getters: true })),
	});
};

const getReviewById = async (req, res, next) => {
	const reviewId = req.params.rid;

	let review;
	try {
		review = await Review.findById(reviewId);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!review) {
		const error = new HttpError("Could not find review", 404);
		return next(error);
	}

	res.json({ review: review.toObject({ getters: true }) });
};

const getReviewsByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	let userWithReviews;
	try {
		userWithReviews = await User.findById(userId).populate("reviews");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!userWithReviews || userWithReviews.length === 0) {
		const error = new HttpError("Could not find reviews for user ID", 404);
		return next(error);
	}

	res.json({
		reviews: userWithReviews.reviews.map((review) =>
			review.toObject({ getters: true })
		),
	});
};

const getReviewsByMovieId = async (req, res, next) => {
	const movieId = req.params.mid;

	let reviews;
	try {
		reviews = await Review.find({ imdbID: movieId });
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!reviews || reviews.length === 0) {
		const error = new HttpError("Could not find reviews for movie ID", 404);
		return next(error);
	}

	res.json({
		reviews: reviews.map((review) => review.toObject({ getters: true })),
	});
};

const createReview = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { imdbID, title, poster, rating, comment, hoard } = req.body;

	const creator = req.userData.userId;

	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!user) {
		const error = new HttpError("could not find user id", 500);
		return next(error);
	}

	const createdReview = new Review({
		imdbID,
		title,
		poster,
		rating,
		comment,
		username: user.name,
		createDate: new Date(),
		lastUpdateDate: new Date(),
		creator,
		hoard
	});

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdReview.save({ session: sess });
		user.reviews.push(createdReview);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(201).json({ review: createdReview });
};

const updateReview = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new HttpError(
			"Invalid inputs passed, please check your data.",
			422
		);
		return next(error);
	}

	const { rating, comment } = req.body;
	const reviewId = req.params.rid;

	let review;
	try {
		review = await Review.findById(reviewId);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (review.creator.toString() !== req.userData.userId) {
		const error = new HttpError("Not allowed to make changes", 401);
		return next(error);
	}

	review.rating = rating;
	review.comment = comment;

	try {
		await review.save();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(200).json({ review: review.toObject({ getters: true }) });
};

const deleteReview = async (req, res, next) => {
	const reviewId = req.params.rid;
	let review;
	try {
		review = await Review.findById(reviewId).populate("creator");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!review) {
		const error = new HttpError("Could not find id", 500);
		return next(error);
	}

	if (review.creator.id !== req.userData.userId) {
		const error = new HttpError("Not allowed to make changes", 401);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await review.remove({ session: sess });
		review.creator.reviews.pull(review);
		await review.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(200).json({ message: "Deleted review." });
};

exports.getReviews = getReviews;
exports.getReviewById = getReviewById;
exports.getReviewsByUserId = getReviewsByUserId;
exports.getReviewsByMovieId = getReviewsByMovieId;
exports.createReview = createReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
