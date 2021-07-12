const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	imdbID: { type: String, required: true },
	title: { type: String, required: true },
	poster: { type: String, required: false },
	rating: { type: Number, required: true },
	comment: { type: String, required: true },
	username: { type: String, required: true },
	createDate: { type: Date, required: true },
	lastUpdateDate: { type: Date, required: true },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
	collection: { type: mongoose.Types.ObjectId, required: true, ref: "Collection" },
});

module.exports = mongoose.model("Review", reviewSchema);
