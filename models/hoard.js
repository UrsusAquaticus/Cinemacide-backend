const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const hoardSchema = new Schema({
	title: { type: String, required: true },
	username: { type: String, required: true },
	createDate: { type: Date, required: true },
	lastUpdateDate: { type: Date, required: true },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
	public: { type: Boolean, required: true },
	sharedUsers: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
	reviews: [{ type: mongoose.Types.ObjectId, required: true, ref: "Review" }],
});

module.exports = mongoose.model("Hoard", hoardSchema);
