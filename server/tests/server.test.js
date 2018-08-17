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
        _id: new ObjectID()
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