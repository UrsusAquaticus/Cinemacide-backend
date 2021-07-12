const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
	title: { type: String, required: true },
	username: { type: String, required: true },
	createDate: { type: Date, required: true },
	lastUpdateDate: { type: Date, required: true },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
	reviews: [{ type: mongoose.Types.ObjectId, required: false, ref: "Review" }],
	public: { type: Boolean, required: true},
	sharedUsers: [{ type: mongoose.Types.ObjectId, required: false, ref: "User" }],
});

module.exports = mongoose.model("Collection", collectionSchema);