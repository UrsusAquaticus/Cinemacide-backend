const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 7 },
	image: { type: String, required: true },
	reviews: [{ type: mongoose.Types.ObjectId, required: true, ref: "Review" }],
	collections: [{ type: mongoose.Types.ObjectId, required: true, ref: "Collection" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
