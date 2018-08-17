const {MongoClient, ObjectID } = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', ( err, client ) => {
    if( err ){
        return console.log( 'Unable to connect to MongoDb Server' );
    }

    console.log( 'Success to connect to MongoDb Server' );
    const db = client.db( 'TodoApp' );
    db.collection( 'Todos' ).findOneAndDelete ( { completed: false } ).then( ( result ) => {
        console.log( result );
    }, (err) => {
        console.log( 'Unable to delete data', err );
    });
    // client.close();
});