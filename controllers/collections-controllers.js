const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Collection = require("../models/collection");
const User = require("../models/user");

const getCollections = async (req, res, next) => {
	let collections;
	try {
		collections = (await Collection.find()).reverse();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}
	res.json({
		collections: collections.map((collection) => collection.toObject({ getters: true })),
	});
};

const getCollectionById = async (req, res, next) => {
	const collectionId = req.params.rid;

	let collection;
	try {
		collection = await Collection.findById(collectionId);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!collection) {
		const error = new HttpError("Could not find collection", 404);
		return next(error);
	}

	res.json({ collection: collection.toObject({ getters: true }) });
};

const getCollectionsByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	let userWithCollections;
	try {
		userWithCollections = await User.findById(userId).populate("collections");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!userWithCollections || userWithCollections.length === 0) {
		const error = new HttpError("Could not find collections for user ID", 404);
		return next(error);
	}

	res.json({
		collections: userWithCollections.collections.map((collection) =>
			collection.toObject({ getters: true })
		),
	});
};

const getCollectionsByMovieId = async (req, res, next) => {
	const movieId = req.params.mid;

	let collections;
	try {
		collections = await Collection.find({ imdbID: movieId });
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!collections || collections.length === 0) {
		const error = new HttpError("Could not find collections for movie ID", 404);
		return next(error);
	}

	res.json({
		collections: collections.map((collection) => collection.toObject({ getters: true })),
	});
};

const createCollection = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { imdbID, title, poster, rating, comment } = req.body;

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

	const createdCollection = new Collection({
		imdbID,
		title,
		poster,
		rating,
		comment,
		username: user.name,
		createDate: new Date(),
		lastUpdateDate: new Date(),
		creator,
	});

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdCollection.save({ session: sess });
		user.collections.push(createdCollection);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(201).json({ collection: createdCollection });
};

const updateCollection = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new HttpError(
			"Invalid inputs passed, please check your data.",
			422
		);
		return next(error);
	}

	const { rating, comment } = req.body;
	const collectionId = req.params.rid;

	let collection;
	try {
		collection = await Collection.findById(collectionId);
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (collection.creator.toString() !== req.userData.userId) {
		const error = new HttpError("Not allowed to make changes", 401);
		return next(error);
	}

	collection.rating = rating;
	collection.comment = comment;

	try {
		await collection.save();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(200).json({ collection: collection.toObject({ getters: true }) });
};

const deleteCollection = async (req, res, next) => {
	const collectionId = req.params.rid;
	let collection;
	try {
		collection = await Collection.findById(collectionId).populate("creator");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!collection) {
		const error = new HttpError("Could not find id", 500);
		return next(error);
	}

	if (collection.creator.id !== req.userData.userId) {
		const error = new HttpError("Not allowed to make changes", 401);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await collection.remove({ session: sess });
		collection.creator.collections.pull(collection);
		await collection.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	res.status(200).json({ message: "Deleted collection." });
};

exports.getCollections = getCollections;
exports.getCollectionById = getCollectionById;
exports.getCollectionsByUserId = getCollectionsByUserId;
exports.getCollectionsByMovieId = getCollectionsByMovieId;
exports.createCollection = createCollection;
exports.updateCollection = updateCollection;
exports.deleteCollection = deleteCollection;
