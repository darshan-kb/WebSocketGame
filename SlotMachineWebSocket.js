//import express from "express";
const tpdata = require("./services/tempdata.js");
const uuid = require("./services/uuid.js");
const apl = require("./services/allpayload.js");
const http = require("http"); // creating http server
const path = require('path');
const result = require("./services/result.js");
const payloadsend = require("./services/payloadsend.js");
const queueops = require("./services/queueop.js");
const mongodbop = require("./services/mongodb.js");
const dotenv = require("dotenv");
const db = require("./config/db.js");

const mongoose = require("mongoose");

dotenv.config();

let count = 60;
const QUEUESENDTIME = -40;
//connectDB();

//mongodb
// const MongoClient = require('mongodb').MongoClient;
// const uri = 'mongodb://localhost:27017';
// const db = 'slotmachine';
//mongodbop.mongodbConnection();
//game.insertOne({"hello": "world"});
//console.log(game);

const { send } = require("process");
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'./views'))

app.use(express.static(path.join(__dirname,"./frontend")));

db.connect().then(()=>{
    console.log('Mongodb connected');
    app.listen(9998, () => console.log("listening on 9998"));
}).catch((err)=>{
    console.error(err);
})



// .then(() => {
//     console.log('connected to MongoDB');
//     
// }).catch((err)=>{
//     console.error(err);
// })

app.get("/",(req,res)=> res.sendFile(path.join(__dirname, "./frontend/SlotMachine_Front.html")));


app.get("/report", (req, res)=>{
    
    db.finddata().then(
        (result)=>{
            res.render('pages/report', {pageTitle: 'welcome', result: result, items:items});
        }
    );
    
})
//app.use(express.static("frontend"));
const webSocketServer = require("websocket").server; //creating websocket server this will give a class which contains all the events

let connections = [];


const httpserver = http.createServer((req, res) =>{
    console.log("we have received a request");
})
httpserver.listen(9999, () => console.log("My server is listening 9999"));
const clients = {};
const clientarry=[];
const websocket = new webSocketServer({ //It takes the JSON. 
    "httpServer" : httpserver           //we have to pass httpserver object to it. Its just the handshake part. httpserver has the socket for the TCP connection
})
let allDataN = [];

let res1 = [];
let res2 = [];
let queue = [];
let slot1 = 0;
let slot2 = 0;
let gameID = null;

websocket.on("request", request=>{
    let connection = request.accept(null, request.origin);
    let clientID = uuid.generateUUID();
    connections.push(apl.con_array_payload(clientID, connection));
    console.log(connection);
    connection.on("open", ()=> console.log("Opened"));
    connection.on("close", ()=> {
        console.log("closed");
        let i=0;
        //remove the connection id that is disconnected
        for(let c of connections){
            if(c.connection.state === "closed"){
                connections.splice(i,1);
            }
            i++;
        }
    });



    connection.on("message", message=>{                             // this method is called when we call ws.send from the client
        let request = JSON.parse(message.utf8Data);
        console.log(request);
        if(request.method === "AddData" && count>=10){         //Bet amount adding to the array
            let data = request.dataArr;
            let pdata = tpdata.preprocessdata(data);
            let ticketID = uuid.generateUUID();
            db.addticket(apl.all_db_ticket_payload(clientID,ticketID,pdata),gameID);
            allDataN = tpdata.addData(data);
            ticketpayload = apl.ticket_response_payload(ticketID,pdata);
            payloadsend.findConnectionAndSend(request.clientID, ticketpayload,connections);
        }    

        if(request.method === "AddData" && count<10){
            let payload = {
                "method" : "AccessDenied"
            }
            payloadsend.findConnectionAndSend(request.clientID, payload,connections);
            
        }

    }) 

    
    payloadsend.payLoadSendToAll(apl.queue_payload(queue),connections);                                    //when client connect for the first time then send the queue from the server

    connection.send(JSON.stringify(apl.init_payload(clientID)));

    if(count<0){                                   //If client connect in between the spinning then sent the 0:0 time to client
        payloadsend.payLoadSendToAll(apl.spin_count_payload(),connections);
    }

    if(count < 0 && count>=-25){          // If the client connected in between the spinning then decrease the spin time so that result get print before -30;

        connection.send(JSON.stringify(apl.connect_between_game_payload(res1,res2,count)));
    }

});



countDown();
function countDown(){
    addflag=true;
    //spin=-1;
    count=60;
    var x = setInterval(function(){

        //gameID will be generated once the game is started
        if(count==60){
            gameID = uuid.generateUUID();
            db.addgame(apl.game_start_data(gameID,slot1,slot2));
            //game.insertOne(apl.game_start_data(gameID,slot1,slot2));
        }
        console.log(count);
        
        let min = parseInt(count/60);
        let sec = count%60;

        if(count>=0){                               //send the time when it is greater than 0
            payloadsend.payLoadSendToAll(apl.send_count_payload(min,sec),connections);
        }

        
        
        count-=1;

        if(count == -1){              //when countdown is equal to 0 send the result to the client, equal to will avoid sending the result again and again
            const res = result.resultSend(allDataN,connections);
            res1 = res.res1;
            res2 = res.res2;
            slot1 = res.slot1;
            slot2 = res.slot2;
            clearData();
        }

        if(count===QUEUESENDTIME){              //when the spinning is over send the queue to show the updated history of results
            queueops.sendQueue(queue,slot1,slot2,connections);
            db.updateresult(gameID,slot1,slot2);
        }

        if(count<-60){          //when everthing is done reset the clock
            count = 60;
        }
    },1000);
}


// function sendQueue(){               //sending the queue to the client
//     let sendqpayload = {
//         "method": "displayQueue",
//         "Queue": queue
//     }
//                  // update the value of slot1 and slot2 in db
//     payloadsend.payLoadSendToAll(sendqpayload,connections);
// }



function clearData(){
    for(let i=0;i<27;i++){
        allDataN[i]=0;
    }
}



// //connection setup with MongoDB
// async function mongodbConnection() {
//     const client = new MongoClient(uri, { useUnifiedTopology: true});
//     try {
//       await client.connect();
//       const database = client.db(db);
//       game = database.collection('game');
//       //game_result = database.collection('game_result');
//     } catch (err) {
//       console.log(err.stack);
//     }
//     //await client.close();
//   }
// mongodbConnection();

// //updating the game.tickets to add the player data
// async function addPlayerDataToGame(playerdata){                 
//     try{
//         game.updateOne({"gameID" : gameID}, {$push: {"tickets": playerdata}});
//     }
//     catch(err){
//         console.log(err.stack)
//     }
// }

// //This is the skeleton of the game all the data will be store in the single game object no separate tabel
// async function insertGameDataToMongoDB(gamedata){                       
//     try{
//         game.insertOne(gamedata);
//     }
//     catch(err){
//         console.log(err.stack)
//     }
// }

// //Update the game result in MongoDB
// async function updateresultinDB(){
//     try{
//         game.updateOne({"gameID" : gameID}, {$set: {"slot1": slot1, "slot2": slot2}});
//     }
//     catch(err){
//         console.log(err.stack);
//     }
// }

// //get current game data to render
// async function getcurrentgamedata(){
//     try{
//         const currdata = await game.find({"gameID": gameID});
//         //const data = await currdata.toArray();
//         let data = null;
//         if(await currdata.hasNext()) {
//             const recipe = await currdata.next();
//             data = recipe.tickets;
//           }

//         //let data = JSON.stringify(currdata);
//         console.log(data);
//         return data;
//     }
//     catch(err){
//         console.log(err.stack);
//     }
// }


const items = [
    '🍉',
    '🍗',
    '🍭',
    '🍊',
    '⚔️',
    '🍹',
    '🍿',
    '🧨',
    '☀️',
];