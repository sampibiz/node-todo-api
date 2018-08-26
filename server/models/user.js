const mongoose = require( 'mongoose' );
const validator = require( 'validator' );
const jwt = require( 'jsonwebtoken' );
const _ = require( 'lodash' );

var UserSchema = new mongoose.Schema( {
        email: {
            type: String,
            required: true,
            minlength: 1,
            trim: true,// remove white spaces from begin end end,
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: '{value} is not a valid email'
            },
        },
        password: {
            type: String,
            require: true,
            minLength: 6
        },
        tokens: [{
            access: {
                type: String,
                require: true
            },
            token: {
                type: String,
                require: true
            }
        }]
    }
);

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject(); // convert user mongoose var into a regular object

    return _.pick( userObject, ['_id', 'email' ] );
};

UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign( {_id: user._id.toHexString(), access }, 'secret_value' ).toString();
    user.tokens = user.tokens.concat( [ { access, token } ] );
    return user.save().then( () => {
        return token;
    });
};




UserSchema.statics.getUserByToken = function( token ) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify( token, 'secret_value' );
    } catch( e ) {
        return new Promise( ( revolve, reject ) => {
            reject();
        });
    }
    // find the associated user
    return User.findOne( {
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    } );
};


// creating a model
var User = mongoose.model( 'User', UserSchema );

module.exports = { User };
