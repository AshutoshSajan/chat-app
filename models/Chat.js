const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			default: "",
		},
		msg: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
