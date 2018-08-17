var mongoose = require( 'mongoose' );

// creating a model
var Todo = mongoose.model( 'Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true// remove white spaces from begin end end
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
} );

module.exports = { Todo };
