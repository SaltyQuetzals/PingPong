var mongoose = require("mongoose");
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var pingSchema = new mongoose.Schema({
	tags: [String],
	location: {
		latitude: {type: SchemaTypes.Double, required: true},
		longitude: {type: SchemaTypes.Double, required: true}
	},
	aliases: [{
		token: String,
		alias: String
	}],
	expireby: { type: Date, expires: '1hr', default: Date.now },	// Expire after set time
	pinger: String
});

module.exports = mongoose.model('Ping', pingSchema);
