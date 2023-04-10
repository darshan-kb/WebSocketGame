const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    gameID:{
        type: Number,
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
    amount:{
        type: Number,
        default:0
    },
    reward:{
        type:Number,
        default:0
    },
    ticket:{
        type:[{
            clientID: {type: String},
            ticketID: {type: Number},
            ticketdata: {type: Array},
            dateandtime: {type: Date, default: Date.now}
        }]
    }
});

module.exports = mongoose.model('ticket', ticketSchema);
