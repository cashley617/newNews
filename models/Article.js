const mongoose = require('mongoose');

// Schema constructor 
let Schema = mongoose.Schema; 

// New UserSchema 
let ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    link: { 
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

let Article = mongoose.model("Article", ArticleSchema);

// Export
module.exports = Article; 