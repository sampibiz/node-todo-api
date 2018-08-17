//const MongoClient = require( 'mongodb' ).MongoClient;
const {MongoClient, ObjectID } = require( 'mongodb' );
var obj = new ObjectID();
console.log( obj );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', ( err, client ) => {
    if( err ){
        return console.log( 'Unable to connect to MongoDb Server' );
    }

    console.log( 'Success to connect to MongoDb Server' );
    const db = client.db( 'TodoApp' );
    db.collection( 'Todos' ).insertOne( {
        text: 'Another thing to do',
        completed: false
    }, ( err, results ) => {
        if( err ){
            return console.log( 'Unable to insert todo', err );
        }
        console.log( JSON.stringify( results.ops, undefined, 2 ) );

        console.log( results.ops[0]._id.getTimestamp() );
    });
    client.close();
});