const {MongoClient, ObjectID } = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', ( err, client ) => {
    if( err ){
        return console.log( 'Unable to connect to MongoDb Server' );
    }

    console.log( 'Success to connect to MongoDb Server' );
    const db = client.db( 'TodoApp' );
    db.collection( 'Todos' ).find( ).count().then( ( count ) => {
        console.log( 'Todos' );
        console.log( `Todos count: ${count}` );
    }, (err) => {
        console.log( 'Unable to fetch data', err );
    });
    // client.close();
});