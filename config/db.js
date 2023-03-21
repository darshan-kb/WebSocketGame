const mongoose = require('mongoose');
const ticketModel = require("../model/ticketModel");

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
    }
    catch(err){
        console.error(err.message);
        
    }
};

async function addticket(ticket,gameID){
    try{

        console.log(ticket);
        let tempgame = await ticketModel.findOneAndUpdate({gameID:gameID}, {$push : {ticket:ticket}});
        // tempgame.ticket.push(ticket);
        // tempgame.save(done);
        console.log("ticket added!!");
    }
    catch(err){

    }
}

async function addgame(payload){
    try{
        const data = new ticketModel(payload);
        const savedata = await data.save();

        if(savedata){
            console.log("datasaved successfully");
        }
    }
    catch(err){

    }
}

async function updateresult(gameID, slot1, slot2){
    try{
        let tempgame = await ticketModel.findOneAndUpdate({gameID:gameID}, {$set : {slot1:slot1, slot2:slot2}});
    }
    catch(err){

    }
}

async function finddata(){
    try{
        const start = new Date().toDateString();
        //console.log(start);
        let todaydata = await ticketModel.find({timestamp:{$gte:start}});
        //console.log(todaydata);
        let todaytickets = [];
        for(var i of todaydata){
            for(j of i.ticket){
                todaytickets.push({ticket: j, timestamp:i.timestamp});
            }
        }
        return todaytickets;
    }
    catch(err){

    }
}

module.exports.connect = connectDB;
module.exports.addgame = addgame;
module.exports.addticket = addticket;
module.exports.updateresult = updateresult;
module.exports.finddata = finddata;