const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 7 },
	image: { type: String, required: false },
	reviews: [{ type: mongoose.Types.ObjectId, required: true, ref: "Review" }],
	hoards: [{ type: mongoose.Types.ObjectId, required: true, ref: "Hoard" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
