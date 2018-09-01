const mongoose = require( 'mongoose' );
const validator = require( 'validator' );
const jwt = require( 'jsonwebtoken' );
const _ = require( 'lodash' );
const bcrypt = require( 'bcryptjs' );

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
        first_name: {
            type: String,
            required: false,
            trim: true,// remove white spaces from begin end end,
        },
        last_name: {
            type: String,
            required: false,
            trim: true,// remove white spaces from begin end end,
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

UserSchema.methods.removeToken = function( token ){
    var user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.getUserByToken = function( token ) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify( token, 'secret_value' );
    } catch( e ) {
        return Promise.reject();
    }
    // find the associated user
    return User.findOne( {
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    } );
};

UserSchema.statics.findByCredentials = function( email, password ) {
    var User = this;

    return User.findOne( { email} ).then( (user) => {
        if( !user ) {
            return Promise.reject();
        }

        return new Promise( (resolve, reject) => {
             bcrypt.compare( password, user.password, ( err, res ) => {
                 if( res === true ){
                     resolve( user );
                 } else {
                     reject();
                 }
             });
        } );
    } );
};

UserSchema.pre( 'save', function( next ) {
    var user = this;

    if( user.isModified( 'password' )) {
        bcrypt.genSalt( 10, ( err, salt ) =>{
            bcrypt.hash( user.password, salt, ( err, hash ) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
} );


// creating a model
var User = mongoose.model( 'User', UserSchema );

module.exports = { User };
