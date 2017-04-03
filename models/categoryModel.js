var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var categoryModel = new Schema({
    name: String,
    author: String,
    postby: { type: Schema.Types.ObjectId, ref: 'User' },
    introduce: String,
    types: [{ type: Schema.Types.ObjectId, ref: 'Type' }],
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    type: String,
    img: String,
    totalchap: Number
});
module.exports = mongoose.model('Category', categoryModel);