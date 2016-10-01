var mongoose = require("mongoose");

var pingSchema = new mongoose.Schema({
	tags: [String],
	location: [Number],
	Aliases: [Object],
	expireby: { type: Date, expires: '1hr', default: Date.now },	// Expire after 10 minutes
	Pinger: String
});

module.exports = mongoose.model('Ping', pingSchema);
