const mongoose = require('mongoose');
const ticketModel = require("../model/ticketModel");
const user = require("../model/User");
const sequence = require("../model/Sequence");
const apl = require("../services/allpayload.js");

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

async function addticket(clientID,arr,gameID){
    try{
        const sequenceDoc = await sequence.findOneAndUpdate({_id:"ticket"},{$inc:{sequencevalue:1}},{returnOrigin:false, writeConcern:{w:"majority"}});
        console.log(typeof sequenceDoc.sequencevalue);
        const ticket=apl.all_db_ticket_payload(clientID,sequenceDoc.sequencevalue,arr);
        console.log(ticket);
        const data = await ticketModel.findOne({gameID:gameID});
        let dataarr = data.gameArray;
        for(let i=0;i<12;i++){
            dataarr[i] += arr[i];
        }

        await ticketModel.findOneAndUpdate({gameID:gameID}, {$push : {ticket:ticket}, $set : {gameArray : dataarr}});
        
        console.log("ticket added!!");
        return sequenceDoc.sequencevalue;
        
    }
    catch(err){
        console.log(err)
    }
}

async function getDataArray(gameID){
    try{
        const data = await ticketModel.findOne({gameID:gameID});
        let dataarr=[];
        //console.log(data.gameArray)
        for(let i=0;i<12;i++){
            dataarr[i] = parseInt(data.gameArray[i]);
        }
        return dataarr;
    }
    catch(err){

    }
}

async function generateGameID(){
    try{
        const sequenceDoc = await sequence.findOneAndUpdate({_id:process.env.GAME_VALUE},{$inc:{sequencevalue:1}},{returnOrigin:false, writeConcern:{w:"majority"}});
        console.log("GameID : "+sequenceDoc.sequencevalue);
        return sequenceDoc.sequencevalue;
    }
    catch(err){

    }
}

async function updateAllDataArray(gameID,arr){
    try{
        const data = await ticketModel.findOne({gameID:gameId});
        let dataarr = data.gameArray;
        for(let i=0;i<9;i++){
            dataarr[i] += arr[i];
        }
        await ticketModel.findOneAndUpdate({gameID:gameID},{$set : {gameArray:dataarr}});
    }
    catch(err){

    }
}

async function addgame(payload){
    try{
        const data = await ticketModel.create(payload);
        //const data = new ticketModel(payload);
        //const savedata = await data.save();

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

async function fetchresult(gameID){
    try{
        let data = await ticketModel.findOne({gameID:gameID});
        const res = {slot1: data.slot1, slot2 : data.slot2};
        return res;
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
        const pr = await findprofitdata();
        const adminpayload={
            result : pr,
            users : users
        }
        return adminpayload;
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

async function update_total_sum_reward(gameID){
    try{
        const data = await ticketModel.findOne({gameID:gameID});
        const reels = [0,0,0,0,0,0,0,0,0,0,0,0];
        let sum=0;
        for(let i of data.ticket){
            let c = 0;
            for(let j of i.ticketdata){
                reels[c]+=j;
                c++;
                sum+=j;
            }
        }
        const slot1 = data.slot1;
        const slot2 = data.slot2;
        const prize=[0,10,20,30];

        const reward = reels[slot1]*prize[slot2+1];

        console.log(sum+" "+ reward);

        await ticketModel.findOneAndUpdate({gameID:gameID},{$set:{amount:sum, reward:reward}});

        return {sum:sum, reward:reward};
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

async function changeResult(req,gameID){
    try{
        await updateresult(gameID,req.slot1, req.slot2);
        return true;
    }
    catch(err){

    }
}

async function updatebalance(gameID){
    try{
        //const d = await fetchresult(gameID);
        const data = await ticketModel.findOne({gameID:gameID});
        //console.log(data);
        const slot1 = data.slot1;
        const slot2 = data.slot2;
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
            console.log(val);
            await user.findOneAndUpdate({email:ind},{$inc:{balance:val}});
        }

        return users;
    }
    catch(err){
        console.log(err)
    }
}

async function findNdata(){
    try{
        const todaydata = await ticketModel.find().sort({timestamp:-1}).limit(5);
        return todaydata;
    }
    catch(err){
        console.log(err);
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
                todaytickets.push({ticket: i.ticket[j], timestamp:i.timestamp, slot1:i.slot1, slot2:i.slot2, client:i.ticket[j].clientID});
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
module.exports.generateGameID = generateGameID;
module.exports.fetchresult = fetchresult;
module.exports.findNdata = findNdata;
module.exports.changeResult = changeResult;

