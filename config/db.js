const mongoose = require('mongoose');
const ticketModel = require("../model/ticketModel");
const user = require("../model/User");

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
        console.log("ticket from here");
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
        await ticketModel.findOneAndUpdate({gameID:gameID}, {$set : {slot1:slot1, slot2:slot2}});
    }
    catch(err){

    }
}

async function balancecheck(tdata,clientID){
    try{
        
        let sum=0;
        for(let d of tdata){
            sum+=d;
        }
        console.log("sum : "+sum);
        const data = await user.findOne({email:clientID});
        if(data.balance < sum){
            return -1;
        }
        const newbal = data.balance - sum;
        await user.findOneAndUpdate({email:clientID},{$set:{balance:newbal}});
        return newbal;
    }
    catch(err){

    }
}

async function findalluser(){
    try{
        const data = await user.find({}).select('email');
        let users=[];
        for(let i of data){
            users.push(i.email);
        }
        return users;
    }
    catch(err){

    }
}

async function rechargebalance(request){
    try{
        
        //const data = await user.findOne({email:request.email});
        //const newbal = data.balance + parseInt(request.amt);
        await user.findOneAndUpdate({email:request.email},{$inc:{balance:parseInt(request.amt)}});
        return true;
    }
    catch(err){
        return false;
    }
}

async function update_total_sum_reward(sum,reward,gameID){
    try{
        await ticketModel.findOneAndUpdate({gameID:gameID},{$set:{amount:sum, reward:reward}});
    }
    catch(err){
        
    }
}
async function initbalancecheck(clientID){
    try{
        const data = await user.findOne({email:clientID});
        return data.balance;
    }
    catch(err){

    }
}

async function updatebalance(slot1,slot2,gameID){
    try{
        const data = await ticketModel.findOne({gameID:gameID});
        //console.log(data);
        let users=[];
        const prize=[0,10,20,30];
        for(let tic of data.ticket){
            if(users[tic.clientID]==null){
                users[tic.clientID] = tic.ticketdata[slot1]*prize[slot2+1];
            }
            else{
                users[tic.clientID] += tic.ticketdata[slot1]*prize[slot2+1];
            }
        }
        //console.log(users);
        for(let ind of Object.keys(users)){
            let val = users[ind];
            await user.findOneAndUpdate({email:ind},{$inc:{balance:val}});
        }

        return users;
    }
    catch(err){
        console.log(err)
    }
}

async function finddata(){
    try{
        const start = new Date().toDateString();
        //console.log(start);
        let todaydata = await ticketModel.find({timestamp:{$gte:start}}).sort({timestamp:-1}).limit(5);
        //console.log(todaydata);
        let todaytickets = [];
        for(var i of todaydata){
            for(var j=i.ticket.length-1;j>=0;j--){
                todaytickets.push({ticket: i.ticket[j], timestamp:i.timestamp, slot1:i.slot1, slot2:i.slot2});
            }
        }
        return todaytickets;
    }
    catch(err){
        console.log(err);
    }
}

async function findprofitdata(){
    try{
        //const start = new Date().toDateString();
        let todaydata = await ticketModel.find().sort({timestamp:-1}).limit(20);
        let last20tickets = [];
        for(var i of todaydata){
            last20tickets.push({GameID: i.gameID, Amount:i.amount, Reward:i.reward}); 
        }
        return last20tickets;
    }
    catch(err){
        console.log(err);
    }
}

module.exports.connect = connectDB;
module.exports.addgame = addgame;
module.exports.addticket = addticket;
module.exports.updateresult = updateresult;
module.exports.finddata = finddata;
module.exports.balancecheck = balancecheck;
module.exports.initbalancecheck = initbalancecheck;
module.exports.findalluser = findalluser;
module.exports.rechargebalance = rechargebalance;
module.exports.update_total_sum_reward = update_total_sum_reward;
module.exports.updatebalance = updatebalance;
module.exports.findprofitdata = findprofitdata;