var mongoose = require("mongoose");
require('mongoose-double')(mongoose);

var pongSchema = new mongoose.Schema({
    pingId: String, // Mongoose default ID
    createdAt: {
        type: Date,
        expires: '1hr',
        default: Date.now
    }
});

module.exports = mongoose.model('Pong', pongSchema);
