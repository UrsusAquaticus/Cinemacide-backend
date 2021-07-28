const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	imdbID: { type: String, required: true },
	title: { type: String, required: true },
	poster: { type: String, required: false },
	rating: { type: Number, required: false },
	comment: { type: String, required: false },
	username: { type: String, required: true },
	createDate: { type: Date, required: true },
	lastUpdateDate: { type: Date, required: true },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
	public: { type: Boolean, required: true },
	hoard: { type: mongoose.Types.ObjectId, required: true, ref: "Hoard" },
});

module.exports = mongoose.model("Review", reviewSchema);
