var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    authyId: String,
    tags: [{
        type: String
    }],
    verified: {
        type: Boolean,
        default: false
    },
	notID:	{
		type: String,
		required: true
	},
	os:	{
		type: String,
		required: true
	}
});

module.exports = mongoose.model('User', userSchema);
