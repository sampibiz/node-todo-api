const {MongoClient, ObjectID } = require( 'mongodb' );

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', ( err, client ) => {
    if( err ){
        return console.log( 'Unable to connect to MongoDb Server' );
    }

    console.log( 'Success to connect to MongoDb Server' );
    const db = client.db( 'TodoApp' );
    db.collection( 'Todos' ).findOneAndUpdate(
        {
            _id: new ObjectID( '5b6a89ca656376680bb7b5e7' )
        }, {
            $inc: {
                age: 1
            }
        }, {
            returnOriginal: false
        }).then( ( result ) => {
        console.log( result );
    }, (err) => {
        console.log( 'Unable to update data', err );
    });
    // client.close();
});