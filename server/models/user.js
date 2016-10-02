var mongoose = require("mongoose");
require('mongoose-double')(mongoose);

var userSchema = new mongoose.Schema({
    countryCode: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    SMScode: String,
    tags: [{type: String}],
    verified: {
        type: Boolean,
        default: false
    },
	noteID:	{
		type: String,
		required: true
	},
	os:	{
		type: String,
		required: true
	}
});

module.exports = mongoose.model('User', userSchema);
