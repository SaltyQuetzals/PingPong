var mongoose = require("mongoose");

var userInterestSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true
	},
	tag: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('UserInterest', userInterestSchema)
