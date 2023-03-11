const http = require("http"); // creating http server
const { send } = require("process");
const app = require("express")();
app.listen(9998, ()=>console.log("listening on http port 9998"));
app.get("/",(req,res)=> res.sendFile(_dirname+"/index.html"));

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

websocket.on("request", request=>{
    //console.log("hello");
    let connection = request.accept(null, request.origin);
    connections.push(connection);
    connection.on("open", ()=> console.log("Opened"));
    connection.on("close", ()=> console.log("closed"));
    connection.on("message", message=>{                             // this method is called when we call ws.send from the client
        //console.log(`message - ${message.utf8Data}`);
        let request = JSON.parse(message.utf8Data);
        console.log(request);
        if(request.method === "AddData" && count>=10){         //Bet amount adding to the array
            let data = request.dataArr;
            addData(data);
        }    

        if(request.method === "AddData" && count<10){
            const payload = {
                "method" : "AccessDenied"
            }
            connections.forEach(function(item){
                item.send(JSON.stringify(payload));
            });
        }

    }) 
    sendQueue();                                    //when client connect for the first time then send the queue from the server

    const initpayload={
        "method": "init"
    }
    connections.forEach(function(item){
        item.send(JSON.stringify(initpayload));
    });

    if(count<0){                                   //If client connect in between the spinning then sent the 0:0 time to client
        const countPayload ={
            "method": "countdown",
            "count": "0:0"
        }
        connections.forEach(function(item){
            item.send(JSON.stringify(countPayload));
        });
    }

    if(count < 0 && count>=-25){          // If the client connected in between the spinning then decrease the spin time so that result get print before -30;
        const payload={
            "method": "result",
            "res1": res1,
            "res2": res2,
            "spin": (30+count)
        }
        connection.send(JSON.stringify(payload));
    }

});

function addData(data){                         //Amount of money bet data add to array;
    for(let i=0;i<9;i++){
        let tmp=parseInt(data[i])
        allDataN[i] += tmp;
        allDataN[i+9] += tmp*2;
        allDataN[i+18] += tmp*3;
    }
}


countDown();
function countDown(){
    addflag=true;
    //spin=-1;
    count=60;
    var x = setInterval(function(){
        console.log(count);
        
        let min = parseInt(count/60);
        let sec = count%60;

        if(count>=0){                               //send the time when it is greater than 0
            const payload ={
                "method": "countdown",
                "count": min+":"+sec
            }
            connections.forEach(function(item){
                item.send(JSON.stringify(payload));
            });
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


function sendQueue(){
    const payload = {
        "method": "displayQueue",
        "Queue": queue
    }
    connections.forEach(function(item){
        item.send(JSON.stringify(payload));
    });
}

function resultSend(){
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

    const payload ={
        "method": "result",
        "res1": res1,
        "res2": res2,
        "spin": 30
    }
    connections.forEach(function(item){
        item.send(JSON.stringify(payload));
    });
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
