var mongoose = require( 'mongoose' );

// creating a model
var User = mongoose.model( 'User', {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true// remove white spaces from begin end end
    }
} );

module.exports = { User };
