const expect = require( 'expect' );
const request = require( 'supertest' );
const {ObjectID} = require( 'mongodb' );

const {app} = require( './../server' );
const {Todo} = require( './../models/todo' );

const todos = [
    {
        text: 'First test todo',
        _id: new ObjectID()
    },
    {
        text: 'Second test todo',
        _id: new ObjectID(),
        completed: true,
        completedAt: 213421
    },
    {
        text: 'Third test todo',
        _id: new ObjectID()
    },
];

beforeEach( (done) => {
    // remove all todos
    Todo.remove( {} ).then( () => {
        return Todo.insertMany( todos );
    } ).then( () => done() ) ;
});

describe( 'Post/ Todos', () => {
    it( 'should create a new todo', ( done ) => {
        var text = 'Test todo text';

        request( app )
            .post( '/todos' )
            .send( { text } )
            .expect( 200 )
            .expect( ( res ) => {
                expect( res.body.text ).toBe( text );
            })
            .end( ( err, res ) => {
                if( err ) {
                    return done( err );
                }

                Todo.find( {text} ).then( (todos) => {
                    expect( todos.length ).toBe( 1 );
                    expect( todos[0].text ).toBe( text );
                    done();
                }).catch( (e) => done( e ));
            });
    });
});

describe( 'Get/ Todos', () => {
    it( 'should get all todos', ( done ) => {
        request( app )
            .get( '/todos' )
            .expect( 200 )
            .expect( ( res ) => {
                expect( res.body.todos.length ).toBe( 3 );
            })
            .end( done );
    });
} );

describe( 'Get/ todos/:id', () => {
    it( 'should return todo doc', ( done ) => {
        request( app )
            .get( `/todos/${todos[0]['_id'].toHexString()}`)
            .expect( 200 )
            .expect( ( res ) => {
                expect( res.body.todo.text ).toBe( todos[0]['text'] );
            })
            .end( done );
    });

    it( 'should return 404 if todo not found', ( done ) => {
        var hexId = new ObjectID().toHexString();
        request( app )
            .get( `/todos/${hexId}`)
            .expect( 404 )
            .end( done );
    });

    it( 'should return 404 if not object-id', ( done ) => {
        // get back 404
        request( app )
            .get( `/todos/123abc`)
            .expect( 404 )
            .end( done );
    });

});

describe( 'DELETE/ todos/:id', () => {
    it( 'should delete todo doc', ( done ) => {
        var hexID = todos[0]['_id'].toHexString();
        request( app )
            .delete( `/todos/${hexID}`)
            .expect( 200 )
            .expect( ( res ) => {
                expect( res.body.todo._id ).toBe( hexID );
            })
            .end( ( err, res ) => {
                if( err ) {
                    return err;
                }
                // verify that the todo doc was deleted
                Todo.findById( hexID ).then( ( todo ) => {
                    expect( todo ).toNotExist();
                    done();
                }).catch( (e) => done( e ) );
            });
    });

    it( 'should return 404 if todo not found', ( done ) => {
        var hexId = new ObjectID().toHexString();
        request( app )
            .get( `/todos/${hexId}`)
            .expect( 404 )
            .end( done );
    });

    it( 'should return 404 if not object-id', ( done ) => {
        // get back 404
        request( app )
            .get( `/todos/123abc`)
            .expect( 404 )
            .end( done );
    });
});

describe( 'UPDATE/ todos/:id', () => {
    it( 'should update todo doc', ( done ) => {
        var hexID = todos[0]['_id'].toHexString();
        var text = 'This is the new todo text';
        request( app )
            .patch( `/todos/${hexID}`)
            .send( {
                text,
                completed: true
            } )
            .expect( 200 )
            .expect( ( res ) => {
                expect( res.body.todo.text ).toBe( text );
                expect( res.body.todo.completed ).toBe( true );
                expect( res.body.todo.completedAt ).toBeA( 'number' );
            })
            .end( done );
    });

    it( 'should clear "completedAt" when todo is not completed', ( done ) => {
        var hexID = todos[1]['_id'].toHexString();
        var text = 'This is the new todo text!!!';
        request( app )
            .patch( `/todos/${hexID}`)
            .send( {
                text,
                completed: false
            } )
            .expect( 200 )
            .expect( ( res ) => {
                expect( res.body.todo.text ).toBe( text );
                expect( res.body.todo.completed ).toBe( false );
                expect( res.body.todo.completedAt ).toNotExist( );
            })
            .end( done );
    });
});