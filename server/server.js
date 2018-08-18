const _ = require( 'lodash' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const {ObjectID} = require( 'mongodb' );

var {mongoose} = require( './db/mongoose.js' );
var {Todo} = require( './models/todo.js' );
var {User} = require( './models/user.js' );

const port = process.env.PORT || 3000;

var app = express();

app.use( bodyParser.json() );

app.post( '/todos', ( req, res ) => {
    console.log( req.body );
    // create a new Todo instance
    var todo = new Todo( {
        text: req.body.text
    } );

    // save it to the DB
    todo.save( ).then( ( doc ) => {
        // send response to the client
        res.send( doc )
    }, ( err ) => {
        // send err msg to the client
        res.status( 400 ).send( err );
    });
});

app.get( '/todos', ( req, res ) => {
    Todo.find().then( ( todos ) => {
        // better to send an object instead of an array -
        // it is more flexible and allow us to add more properties if needed
        res.send( { todos } );
    }), ( e ) => {
        res.status(400).send( e );
    };
});

app.get( '/todos/:id', ( req, res ) => {
    var id = req.params.id;
    if( !ObjectID.isValid( id ) ){
        res.status( 404 ).send( );
    }

    Todo.findById( id ).then( ( todo ) => {
        if( !todo ){
            return res.status( 404 ).send( );
        }
        res.status( 200 ).send( { todo } );
    }).catch( (e) => {
        res.status( 400 ).send( );
    });
});


app.delete( '/todos/:id', ( req, res ) => {
    var id = req.params.id;
    if( !ObjectID.isValid( id ) ){
        res.status( 404 ).send( );
    }

    Todo.findByIdAndRemove( '5b72aa2beaef28222418a02e' ).then( ( todo ) => {
        if( !todo ){
            return res.status( 404 ).send( );
        }
        res.status( 200 ).send( { todo } );
    }).catch( (e) => {

    });
});


app.patch( '/todos/:id', ( req, res ) => {
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

    Todo.findByIdAndUpdate( id, { $set : body }, { new: true } ).then( ( todo ) => {
        if( !todo ) {
            return res.status( 400 ).send( );
        }

        res.status( 200 ).send( todo );
    }).catch( ( err ) => {
        res.status( 400 ).send( );
    }) ;
});

/* app.post( 'todos', ( reg, res ) => {

});*/

app.listen( port, () => {
    console.log( `Started at port ${port}` );
});

module.exports = {app};


/*
const {ObjectID} = require( 'mongodb' );

var id = '5b72aa2beaef28222418a02c';
if( !ObjectID.isValid( id ) ){
    console.log( 'Id not valid' );
}

Todo.findById( id ).then( ( todo ) => {
    if( !todo ){
        return console.log( 'Id not found' );
    }
    console.log( todo );
}).catch( (e) => {
    console.log( e );
});
 */