const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}
	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new HttpError(
			"Invalid inputs passed, please check your data.",
			422
		);
		return next(error);
	}
	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError("User exists", 422);
		return next(error);
	}

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError("Hash failed", 500);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image:
			"https://c1.scryfall.com/file/scryfall-cards/normal/front/1/6/16185c50-f7b8-4cea-a129-dfad8e9df781.jpg?1591605108",
		password: hashedPassword,
		reviews: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: createdUser.id,
				email: createdUser.email,
			},
			process.env.JWT_KEY,
			{ expiresIn: "1h" }
		);
	} catch (err) {
		const error = new HttpError("Signup failed", 500);
		return next(error);
	}

	res
		.status(201)
		.json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(err, 500);
		return next(error);
	}

	if (!existingUser) {
		const error = new HttpError("Could not login", 500);
		return next(error);
	}

	let isValidPassword;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		const error = new HttpError(err, 403);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError("Invalid credentials", 403);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: existingUser.id,
				email: existingUser.email,
			},
			process.env.JWT_KEY,
			{ expiresIn: "1h" }
		);
	} catch (err) {
		const error = new HttpError("Login failed", 500);
		return next(error);
	}

	res.json({
		message: "Logged in!",
		userId: existingUser.id,
		email: existingUser.email,
		token: token,
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
