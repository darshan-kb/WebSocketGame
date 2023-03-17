const http = require("http"); // creating http server

//mongodb
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const db = 'slotmachine';
let game=null;

async function mongodbConnection() {
    const client = new MongoClient(uri, { useUnifiedTopology: true});
    try {
      await client.connect();
      const database = client.db(db);
      game = database.collection('game');
      //game_result = database.collection('game_result');
    } catch (err) {
      console.log(err.stack);
    }
    //await client.close();
  }
mongodbConnection();

async function addPlayerDataToGame(playerdata){                 //updating the game.tickets to add the player data
    try{
        game.updateOne({"gameID" : gameID}, {$push: {"tickets": playerdata}});
    }
    catch(err){
        console.log(err.stack)
    }
}

async function insertGameDataToMongoDB(gamedata){                       //This is the skeleton of the game all the data will be store in the single game object no separate tabel
    try{
        game.insertOne(gamedata);
    }
    catch(err){
        console.log(err.stack)
    }
}

async function updateresultinDB(){
    try{
        game.updateOne({"gameID" : gameID}, {$set: {"slot1": slot1, "slot2": slot2}});
    }
    catch(err){
        console.log(err.stack);
    }
}


const { send } = require("process");
const app = require("express")();
app.listen(9998, ()=>console.log("listening on http port 9998"));
app.get("/",(req,res)=> res.sendFile(__dirname+"/SlotMachine_Front.html"));

const webSocketServer = require("websocket").server; //creating websocket server this will give a class which contains all the events

let connections = [];
let count = 60;

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

for(let i=0;i<27;i++){
    allDataN[i]=0;

}
let res1 = [];
let res2 = [];
let queue = [];
let slot1 = 0;
let slot2 = 0;
let gameID = null;

websocket.on("request", request=>{
    //console.log("hello");
    let connection = request.accept(null, request.origin);
    let clientID = generateUUID();
    //console.log(clientID);
    connections.push({"clientID" : clientID, "connection": connection});
    console.log(connection);
    connection.on("open", ()=> console.log("Opened"));
    connection.on("close", ()=> {
        console.log("closed");
        let i=0;
        //let closed = JSON.parse(close.utf8Data);
        for(let c of connections){
            if(c.connection.state === "closed"){
                connections.splice(i,1);
            }
            i++;
        }
    });

function preprocessdata(data){
    let ndata = [];
    let c=0;
    for(let i of data){
        if(i!=0){
            ndata[c] = i;
        }
        c++;
    }
    return ndata;
}

    connection.on("message", message=>{                             // this method is called when we call ws.send from the client
        //console.log(`message - ${message.utf8Data}`);
        let request = JSON.parse(message.utf8Data);
        console.log(request);
        if(request.method === "AddData" && count>=10){         //Bet amount adding to the array
            let data = request.dataArr;
            let pdata = preprocessdata(data);
            let ticketID = generateUUID();
            let dbpayload ={
                "clientID" : clientID,
                "ticketID" : ticketID,
                "ticketdata": pdata,
                "dateandtime": new Date()
            }
            addPlayerDataToGame(dbpayload);
            addData(data);
            //console.log(allDataN);
        }    

        if(request.method === "AddData" && count<10){
            let payload = {
                "method" : "AccessDenied"
            }
            findConnectionAndSend(request.clientID, payload);
            
        }

    }) 

    
    sendQueue();                                    //when client connect for the first time then send the queue from the server

    const initpayload={
        "method": "init",
        "clientID": clientID
    }
    payLoadSendToAll(initpayload);

    if(count<0){                                   //If client connect in between the spinning then sent the 0:0 time to client
        const countPayload ={
            "method": "countdown",
            "count": "0:0"
        }
        payLoadSendToAll(countPayload);
    }

    if(count < 0 && count>=-25){          // If the client connected in between the spinning then decrease the spin time so that result get print before -30;
        let payload={
            "method": "result",
            "res1": res1,
            "res2": res2,
            "spin": (30+count)
        }
        connection.send(JSON.stringify(payload));
    }

});

function findConnectionAndSend(clientID, payload){
    for(let c of connections){
        if(c.clientID === clientID){
            console.log("found!");
            c.connection.send(JSON.stringify(payload));
        }
    }
}

function payLoadSendToAll(payload){             //function to send payload to all the clients
    for(let con of connections){
        con.connection.send(JSON.stringify(payload));
    }
}

function addData(data){                         //Amount of money bet data add to array;
    for(let i=0;i<9;i++){
        let tmp=parseInt(data[i])
        allDataN[i] += tmp;
        allDataN[i+9] += tmp*2;
        allDataN[i+18] += tmp*3;
    }
}

function gameData(){
    gameID = generateUUID();

    let GameStartData = {
        "gameID" : gameID,
        "slot1" : slot1,
        "slot2" : slot2,
        "tickets" : []
    }
    insertGameDataToMongoDB(GameStartData);
}

countDown();
function countDown(){
    addflag=true;
    //spin=-1;
    count=60;
    var x = setInterval(function(){
        if(count==60){
            gameData();
        }
        console.log(count);
        
        let min = parseInt(count/60);
        let sec = count%60;

        if(count>=0){                               //send the time when it is greater than 0
            let countpayload ={
                "method": "countdown",
                "count": min+":"+sec
            }
            payLoadSendToAll(countpayload);
        }

        
        
        count-=1;

        if(count == -1){              //when countdown is equal to 0 send the result to the client, equal to will avoid sending the result again and again
            resultSend();
        }

        if(count==-40){              //when the spinning is over send the queue to show the updated history of results
            if(queue.length===5){
                queue.shift();
                queue.push({"firstTile": slot1,"secondTile": slot2});
            }
            else{
                queue.push({"firstTile": slot1,"secondTile": slot2});
            }
            //clearInterval(x);
            sendQueue();
        }

        if(count<-60){          //when everthing is done reset the clock
            count = 60;
        }
    },1000);
}


function sendQueue(){               //sending the queue to the client
    let sendqpayload = {
        "method": "displayQueue",
        "Queue": queue
    }
    updateresultinDB();             // update the value of slot1 and slot2 in db
    payLoadSendToAll(sendqpayload);
}

function resultSend(){              //sending the result of the current game
    let tmp = [];
    let c=0;
    let sum = 0;
    for(let i=0;i<9;i++){
        sum+=allDataN[i];
    }

    for(let i=0;i<27;i++){
        if(sum>=allDataN[i]){
            tmp[c++]=i;
        }
    }

    console.log(tmp);
    let winner = Math.floor(Math.random() * tmp.length);
    slot1 = winner%9;
    slot2 = parseInt(winner/9);

    let resultmongopayload ={
        "gameID" : gameID,
        "slot1": slot1,
        "slot2": slot2
    }

    res1 = [];
    res2 = [];
    c=0;
    for(let i=0;i<9;i++){
        if(i!=slot1){
            res1[c++] = i;
        }
    }
    c=0;
    for(let i=0;i<3;i++){
        if(slot2!=i){
            res2[c++]=i;
        }
    }
    shuffle(res1);
    shuffle(res2);

    res1.push(slot1);
    res2.push(slot2);
    console.log(res1);
    console.log(res2);

    

    let respayload ={
        "method": "result",
        "res1": res1,
        "res2": res2,
        "spin": 30
    }
    payLoadSendToAll(respayload);
    clearData();
}

function clearData(){
    for(let i=0;i<27;i++){
        allDataN[i]=0;
    }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}




function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
