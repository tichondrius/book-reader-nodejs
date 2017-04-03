var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var typeModel = new Schema({
    name: String,
    categories:  [{ type: Schema.Types.ObjectId, ref: 'Category' }],
});

module.exports = mongoose.model("Type", typeModel);