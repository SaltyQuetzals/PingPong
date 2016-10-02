var mongoose = require("mongoose");
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var pingSchema = new mongoose.Schema({
    tags: [String],
    loc: {
        type: String,
        coordinates: [{
            type: SchemaTypes.Double
        }]
    },
    aliases: [{
        token: String,
        alias: String
    }],
    createdAt: {
        type: Date,
        expires: '1hr',
        default: Date.now
    }, // Expire after set time
    pinger: String,
	numberOfPongers: {type: Number, default: 0}
});

pingSchema.index({
    loc: '2dsphere'
});

module.exports = mongoose.model('Ping', pingSchema);
