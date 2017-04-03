var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var userModel = new Schema({
    username: String,
    password: String,
    name: String,
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
    
});

module.exports = mongoose.model('User', userModel);