var {User} = require( './../models/user' );

var authenticate = ( req, res, next ) => {
    var token = req.header( 'x-auth' );
    console.log( token );
    User.getUserByToken( token ).then( ( user ) => {
        if( !user ){
            return Promise.reject( 'No user found' );
        }
        //res.send( user );
        req.user = user;
        req.token = token;
        next();
    }).catch( ( err ) => {
        // send err msg to the client
        res.status( 401 ).send( err );
    });
    next();
};

module.exports = { authenticate };

