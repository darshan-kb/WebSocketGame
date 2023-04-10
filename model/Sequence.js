const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({
    _id:{ 
        type:String,
        require:true
    },
    sequencevalue:{
        type: Number,
        require:true
    }
});


module.exports = mongoose.model('sequence', sequenceSchema);
