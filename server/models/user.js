var UserSchema = new mongoose.Schema({
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
    verified: {
        type: Boolean,
        default: false
    },
    authyId: String,
    email: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('User', userSchema);
