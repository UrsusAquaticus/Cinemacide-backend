const express = require("express");
const mongoose = require("mongoose");

const reviewsRoutes = require("./routes/reviews-routes");
const usersRoutes = require("./routes/users-routes");
const moviesRoutes = require("./routes/movies-routes");
const hoardsRoutes = require("./routes/hoards-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(express.json());
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

	next();
});

app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/hoards", hoardsRoutes);

app.use((req, res, next) => {
	const error = new HttpError("Could not find this route.", 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.roadq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
	)
	.then(() => {
		app.listen(process.env.PORT || 5000);
	})
	.catch((err) => {
		console.log(err);
	});
