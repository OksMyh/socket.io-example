const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    //vkazuemo povidomlennu do jakogo chat nalejyt vono
    chat: {
        type: Schema.ObjectId,
        ref: 'chat'
    }
});
module.exports = mongoose.model('Message', MessageSchema)