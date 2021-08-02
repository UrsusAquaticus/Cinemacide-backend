const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Hoard = require("../models/hoard");
const User = require("../models/user");
const Review = require("../models/review");

const getHoards = async (req, res, next) => {
	let hoards;
	try {
		hoards = (await Hoard.find()).reverse();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}
	res.json({
		hoards: hoards.map((hoard) => hoard.toObject({ getters: true })),
	});
};

const getHoardById = async (req, res, next) => {
	const hoardId = req.params.rid;

	let hoard;
	try {
		hoard = await Hoard.findById(hoardId);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!hoard) {
		const error = new HttpError("Could not find hoard", 404);
		return next(error);
	}

	res.json({ hoard: hoard.toObject({ getters: true }) });
};

const getHoardsByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	let userWithHoards;
	try {
		userWithHoards = await User.findById(userId).populate("hoards");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!userWithHoards || userWithHoards.length === 0) {
		const error = new HttpError("Could not find hoards for user ID", 404);
		return next(error);
	}

	res.json({
		hoards: userWithHoards.hoards.map((hoard) =>
			hoard.toObject({ getters: true })
		),
	});
};

const getHoardsByMovieId = async (req, res, next) => {
	const movieId = req.params.mid;

	let hoards;
	try {
		hoards = await Hoard.find({ imdbID: movieId });
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!hoards || hoards.length === 0) {
		const error = new HttpError("Could not find hoards for movie ID", 404);
		return next(error);
	}

	res.json({
		hoards: hoards.map((hoard) => hoard.toObject({ getters: true })),
	});
};

const createHoard = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { title, public } = req.body;

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

	const createdHoard = new Hoard({
		title,
		username: user.name,
		createDate: new Date(),
		lastUpdateDate: new Date(),
		creator,
		public,
		sharedUsers: [],
		reviews: [],
	});

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdHoard.save({ session: sess });
		user.hoards.push(createdHoard);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(201).json({
		hoard: createdHoard.toObject({ getters: true }),
	});
};

const updateHoard = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new HttpError(
			"Invalid inputs passed, please check your data.",
			422
		);
		return next(error);
	}

	const { rating, comment } = req.body;
	const hoardId = req.params.rid;

	let hoard;
	try {
		hoard = await Hoard.findById(hoardId);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (hoard.creator.toString() !== req.userData.userId) {
		const error = new HttpError("Not allowed to make changes", 401);
		return next(error);
	}

	hoard.rating = rating;
	hoard.comment = comment;

	try {
		await hoard.save();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(200).json({ hoard: hoard.toObject({ getters: true }) });
};

const deleteHoard = async (req, res, next) => {
	const hoardId = req.params.hid;
	let hoard;
	try {
		hoard = await Hoard.findById(hoardId)
			.populate("creator")
			.populate("reviews");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!hoard) {
		const error = new HttpError("Could not find id", 500);
		return next(error);
	}

	if (hoard.creator.id !== req.userData.userId) {
		const error = new HttpError("Not allowed to make changes", 401);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await hoard.deleteOne({ session: sess });
		hoard.creator.hoards.pull(hoard);
		await hoard.creator.save({ session: sess });
		await Review.deleteMany({ _id: { $in: hoard.reviews } });

		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(200).json({ message: "Deleted hoard." });
};

exports.getHoards = getHoards;
exports.getHoardById = getHoardById;
exports.getHoardsByUserId = getHoardsByUserId;
exports.getHoardsByMovieId = getHoardsByMovieId;
exports.createHoard = createHoard;
exports.updateHoard = updateHoard;
exports.deleteHoard = deleteHoard;
