var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var storyModel = new Schema({

    name: String,
    part: Number,
    cat: { type: Schema.Types.ObjectId, ref: 'Category' },
    date: Date,
    img_pre: String,
    text_pre: String,
    img_main: []
    
});

module.exports = mongoose.model('Story', storyModel);