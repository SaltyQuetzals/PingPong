var mongoose = require("mongoose");
require('mongoose-double')(mongoose);

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
