require( './config/config' );
const _ = require( 'lodash' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const {ObjectID} = require( 'mongodb' );

var {mongoose} = require( './db/mongoose.js' );
var {Todo} = require( './models/todo.js' );
var {User} = require( './models/user.js' );
var {authenticate} = require( './middleware/authenticate' );

const port = process.env.PORT || 3000;

var app = express();

app.use( bodyParser.json() );

var cors = require('cors');
app.use(cors());


/* TODOS routes */
app.post( '/todos', authenticate, ( req, res ) => {
    console.log( req.body );
    // create a new Todo instance
    var todo = new Todo( {
        text: req.body.text,
        _creator: req.user._id
    } );
    todo.save( ).then( ( doc ) => {
        // send response to the client
        res.send( doc )
    }, ( err ) => {
        // send err msg to the client
        res.status( 400 ).send( err );
    });
});

app.get( '/todos', authenticate, ( req, res ) => {
    Todo.find( { _creator: req.user._id } ).then( ( todos ) => {
        // better to send an object instead of an array -
        // it is more flexible and allow us to add more properties if needed
        console.log( todos );
        res.send( { todos } );
    }), ( e ) => {
        res.status(400).send( e );
    };
});

app.get( '/todos/:id', authenticate, ( req, res ) => {
    var id = req.params.id;
    if( !ObjectID.isValid( id ) ){
        res.status( 404 ).send( );
    }
    Todo.findOne( {
        _id: id,
        _creator: req.user._id
    } ).then( ( todo ) => {
        if( !todo ){
            return res.status( 404 ).send( );
        }
        res.status( 200 ).send( { todo } );
    }).catch( (e) => {
        res.status( 400 ).send( );
    });
});


app.delete( '/todos/:id', authenticate, ( req, res ) => {
    var id = req.params.id;
    if( !ObjectID.isValid( id ) ){
        res.status( 404 ).send( );
    }
    Todo.findOneAndRemove( {
        _id: id,
        _creator: req.user._id
    } ).then( ( todo ) => {
        if( !todo ){
            return res.status( 404 ).send( );
        }
        res.status( 200 ).send( { todo } );
    }).catch( (e) => {

    });
});


app.patch( '/todos/:id', authenticate, ( req, res ) => {
    var id = req.params.id;
    var body = _.pick( req.body, [ 'text', 'completed' ]);

    if( !ObjectID.isValid( id ) ){
        res.status( 404 ).send( );
    }

    if( _.isBoolean( body.completed ) && body.completed ) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate( { _id: id, _creator: req.user._id } , { $set : body }, { new: true } ).then( ( todo ) => {
        if( !todo ) {
            return res.status( 400 ).send( );
        }

        res.status( 200 ).send( {todo} );
    }).catch( ( err ) => {
        res.status( 400 ).send( );
    }) ;
});

/* END TODOS routes */


/* USERS routes */

app.get( '/users/me', authenticate, ( req, res ) => {
    res.send(  req.user );
});


app.post( '/users', ( req, res ) => {
    let userData = _.pick( req.body, [ 'email', 'password', 'first_name', 'last_name' ]);
    // create a new User instance
    let user = new User( userData );
    user.save().then( ( ) => {
       return user.generateAuthToken();
    }).then( (token) => {
        res.header( 'x-auth', token  ).send( user );
    }).catch( ( err ) => {
        // send err msg to the client
        res.status( 400 ).send( err );
    });
});

app.post( '/users/login', ( req, res ) => {
    let body = _.pick( req.body, [ 'email', 'password' ]);
    console.log( 'Login:' , body );
    User.findByCredentials( body.email, body.password ).then( ( user ) => {
        return user.generateAuthToken().then( ( token ) => {
            res.header( 'x-auth', token  ).send( user );
        });
    }).catch( ( err ) => {
        res.status( 400 ).send( err );
    });
});

app.delete( '/users/me/token', authenticate, ( req, res ) => {
    req.user.removeToken( req.token ).then( () => {
        res.status( 200 ).send( );
    }).catch( ( e ) =>{
        res.send( 400 );
    } );
});

app.listen( port, () => {
    console.log( `Started at port ${port}` );
});

module.exports = {app};

