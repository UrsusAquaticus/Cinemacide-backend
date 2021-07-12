const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	title: { type: String, required: true },
	username: { type: String, required: true },
	createDate: { type: Date, required: true },
	lastUpdateDate: { type: Date, required: true },
});

module.exports = mongoose.model("Review", reviewSchema);
