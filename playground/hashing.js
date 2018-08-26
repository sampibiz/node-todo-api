const jwt = require( 'jsonwebtoken' );

var data = {
    id: 8
};

var token = jwt.sign( data, 'some salt' );
console.log( token );

var decoded = jwt.verify( token, 'some salt' );
console.log( decoded );
//jwt.verify();
