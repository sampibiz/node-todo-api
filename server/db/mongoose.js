var mongoose = require( 'mongoose' );

mongoose.Promise = global.Promise;
const URI = process.env.MONGODB_URI | 'mongodb://localhost:27017/TodoApp';
mongoose.connect( URI );

module.export = { mongoose };