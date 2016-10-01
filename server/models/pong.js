var mongoose = require("mongoose");

var pongSchema = new mongoose.Schema({
	pingID: String,													// Mongoose default ID
	expireby: {
		type: Date,
		expires: '1hr',
		default: Date.now
	}
});

module.exports = mongoose.model('Pong', pongSchema);
