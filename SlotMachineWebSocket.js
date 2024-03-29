//import express from "express";
const path = require('path');
require("dotenv").config({path : "./.env"});
const tpdata = require("./services/tempdata.js");
const uuid = require("./services/uuid.js");
const apl = require("./services/allpayload.js");
const http = require("http"); // creating http server
const result = require("./services/result.js");
const payloadsend = require("./services/payloadsend.js");
const queueops = require("./services/queueop.js");
const db = require("./config/db.js");
const appRoutes = require('./routes/appRoutes');
const cookieParser = require('cookie-parser');
const {requireAuth, checkUser} = require('./middleware/authMiddleware');
const getemail = require('./services/getjwtdetails');



// dotenv.config();

let count = process.env.COUNTDOWN_TIME;
const QUEUESENDTIME = -40;
let GAME_TIMESTAMP = new Date();

const { send } = require("process");
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'./views'))

app.use(express.static(path.join(__dirname,"./frontend")));
app.use(express.static(path.join(__dirname,"./public")));
app.use(express.json());

app.use(cookieParser());

db.connect().then(()=>{
    console.log('Mongodb connected');
    app.listen(9998, () => console.log("listening on 9998"));
}).catch((err)=>{
    console.error(err);
})

//routes
app.get('*', checkUser);
app.use(appRoutes);
//app.get("/slotmachine", requireAuth, (req,res)=> res.sendFile(path.join(__dirname, "./frontend/SlotMachine_Front.html")));


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
//let allDataN = [];

let res1 = [];
let res2 = [];
let slot1 = -1;
let slot2 = -1;
let gameID = null;


websocket.on("request", request=>{
    let connection = request.accept(null, request.origin);
    
    console.log(connection);
    connection.on("open", ()=> {
    });
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

    //connections.push(apl.con_array_payload(clientID, connection));

    



    connection.on("message", message=>{                             // this method is called when we call ws.send from the client
        let request = JSON.parse(message.utf8Data);
        console.log(request);

        if(request.method=="open"){
            connections.push(apl.con_array_payload(request.clientID, connection));
            queueops.sendQueue(connections);
            connection.send(JSON.stringify(apl.init_payload(request.clientID)));
            db.initbalancecheck(request.clientID).then(function(amt){
                
                connection.send(JSON.stringify(apl.balance_check_payload(amt)));
                
            });

            if(count<0){                                   //If client connect in between the spinning then sent the 0:0 time to client
                console.log("count "+count);
                connection.send(JSON.stringify(apl.spin_count_payload()));
            }
        
            if(count < 0 && count>=-25){          // If the client connected in between the spinning then decrease the spin time so that result get print before -30;
                console.log("in spinning");
                connection.send(JSON.stringify(apl.connect_between_game_payload(res1,res2,count)));
            }
        }
        if(request.method === "AddData" && count>=10){         //Bet amount adding to the array
            let data = request.dataArr;
            console.log(data);
            db.balancecheck(data, request.clientID).then(async function(amt){
                if(amt!=-1){
                    const ticketID= await db.addticket(request.clientID,data,gameID);
                    //tpdata.addData(data,allDataN);
                    //console.log(allDataN);
                    ticketpayload = apl.ticket_response_payload(ticketID,data,amt);
                    payloadsend.findConnectionAndSend(request.clientID, ticketpayload,connections);
                }
                else{
                    let payload = {
                        "method" : "InsufficientBalance"
                    }
                    payloadsend.findConnectionAndSend(request.clientID, payload,connections);
                }
            });
            // if(db.balancecheck(data, request.clientID)){
            //     let ticketID = Date.now();
            //     db.addticket(apl.all_db_ticket_payload(request.clientID,ticketID,data),gameID);
            //     tpdata.addData(data,allDataN);
            //     console.log(allDataN);
            //     ticketpayload = apl.ticket_response_payload(ticketID,data);
            //     payloadsend.findConnectionAndSend(request.clientID, ticketpayload,connections);
            // }
            // else{
            //     let payload = {
            //         "method" : "InsufficientBalance"
            //     }
            //     payloadsend.findConnectionAndSend(request.clientID, payload,connections);
            // }
            
        }    

        if(request.method === "AddData" && count<10){
            let payload = {
                "method" : "AccessDenied"
            }
            payloadsend.findConnectionAndSend(request.clientID, payload,connections);
            
        }

    }) 

    
    //payloadsend.payLoadSendToAll(apl.queue_payload(queue),connections);                                    //when client connect for the first time then send the queue from the server

    //connection.send(JSON.stringify(apl.init_payload(clientID)));

    // if(count<0){                                   //If client connect in between the spinning then sent the 0:0 time to client
    //     payloadsend.payLoadSendToAll(apl.spin_count_payload(),connections);
    // }

    // if(count < 0 && count>=-25){          // If the client connected in between the spinning then decrease the spin time so that result get print before -30;

    //     connection.send(JSON.stringify(apl.connect_between_game_payload(res1,res2,count)));
    // }

});

function basicdetails(){
    return {count:count, gameID:gameID};
}

countDown();
function  countDown(){
    addflag=true;
    //spin=-1;
    //count=60;
    var x = setInterval(async function(){
        //console.log(connections);
        //gameID will be generated once the game is started
        if(count==process.env.COUNTDOWN_TIME){
            clearData();
            // gameID = uuid.generateUUID();
            gameID = await db.generateGameID();
            GAME_TIMESTAMP = new Date();
            console.log(apl.game_start_data(gameID,slot1,slot2,GAME_TIMESTAMP));
            db.addgame(apl.game_start_data(gameID,slot1,slot2,GAME_TIMESTAMP));
            
            //game.insertOne(apl.game_start_data(gameID,slot1,slot2));
        }
        console.log(count);
        
        let min = parseInt(count/60);
        let sec = count%60;

        if(count>=0){                               //send the time when it is greater than 0
            payloadsend.payLoadSendToAll(apl.send_count_payload(min,sec),connections);
        }

        
        
        count-=1;

        if(count==10){
            await result.resultSend(allDataN,gameID);
        }

        if(count == -1){              //when countdown is equal to 0 send the result to the client, equal to will avoid sending the result again and again

            const res = await result.prepareResult(gameID);
            res1 = res.res1;
            res2 = res.res2;
            await result.sendResultData(res1,res2,connections);
        }

        if(count===QUEUESENDTIME){              //when the spinning is over send the queue to show the updated history of results
            //db.fetchresult(gameID).then()
            queueops.sendQueue(connections);
            //db.updateresult(gameID,slot1,slot2);
            db.updatebalance(gameID).then(function(users){
                for(let user of Object.keys(users)){
                    db.initbalancecheck(user).then(function(amt){
                        //console.log(amt);
                        payloadsend.findConnectionAndSend(user, apl.balance_check_payload(amt),connections);
                    });
                }
            });
            //payloadsend.payLoadSendToAll(apl.queue_payload(queue),connections);
        }

        if(count<process.env.REST_TIME){          //when everthing is done reset the clock
            count = process.env.COUNTDOWN_TIME;
        }
    },1000);
}


function clearData(){
    // for(let i=0;i<36;i++){
    //     allDataN[i]=0;
    // }
    slot1=-1;
    slot2=-1;
}


const items = [
    '🍉',
    '🍗',
    '🍭',
    '🍆',
    '🍊',
    '⚔️',
    '🍹',
    '🌽',
    '🍿',
    '🧨',
    '☀️',
    '🛺',
  ];

const prize=[0,10,20,30];


module.exports.basicdetails = basicdetails;