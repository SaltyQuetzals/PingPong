var mongoose = require("mongoose");
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

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
    loc: {
        type: [SchemaTypes.Double]
    },
    tags: [{
        type: String
    }],
    verified: {
        type: Boolean,
        default: false
    },
    os: {
        type: String,
        required: true
    }
});

userSchema.index({
    loc: '2dsphere'
});

module.exports = mongoose.model('User', userSchema);
