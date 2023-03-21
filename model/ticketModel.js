const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    gameID:{
        type: String,
        require:true
    },
    slot1:{
        type:Number
    },
    slot2:{
        type:Number
    },
    timestamp:{
        type: Date,
        default: Date.now
    },
    ticket:{
        type:[{
            clientID: {type: String},
            ticketID: {type: String},
            ticketdata: {type: Array},
            dateandtime: {type: Date, default: Date.now}
        }]
    }
});

module.exports = mongoose.model('ticket', ticketSchema);
