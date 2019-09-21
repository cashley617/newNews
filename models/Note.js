const mongoose = require('mongoose');

// Schema 
let Schema = mongoose.Schema; 

// New NoteSchema 
let NoteSchema = new Schema({
    title: String,
    body: String
});

let Note = mongoose.model("Note", NoteSchema); 

// Export 
module.exports = Note; 