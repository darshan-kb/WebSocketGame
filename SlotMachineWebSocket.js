const http = require("http"); // creating http server
const app = require("express")();
app.listen(9998, ()=>console.log("listening on http port 9998"));
app.get("/",(req,res)=> res.sendFile(_dirname+"/index.html"));

const webSocketServer = require("websocket").server; //creating websocket server this will give a class which contains all the events

let connections = [];
let count = 60;
let spin = -1; //spinning time of the reel
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
//let allData1 = [];
//let allData2 = [];
for(let i=0;i<27;i++){
    allDataN[i]=0;
    //allData1[i]=0;
    //allData2[i]=0;
}
let addflag=true;
let spinning=false;
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
        if(request.method === "AddData" && addflag===true){
            let data = request.dataArr;
            
            console.log(data[3]);
            for(let i=0;i<9;i++){
                let tmp=parseInt(data[i])
                allDataN[i] += tmp;
                allDataN[i+9] += tmp*2;
                allDataN[i+18] += tmp*3;
            }
            
                console.log(allDataN);
            
        }

        
        
        

        if(spin>=5 && spinning===true){
            console.log("spinning....")
            const payload={
                "method": "result",
                "res1": res1,
                "res2": res2,
                "spin": spin
            }
            connection.send(JSON.stringify(payload));
        }

        if(request.method === "AddData" && addflag===false){
            const payload = {
                "method" : "AccessDenied"
            }
        }

    }) 
    sendQueue();

    const initpayload={
        "method": "init"
    }
    connections.forEach(function(item){
        item.send(JSON.stringify(initpayload));
    });

    if(count<0){
        const countPayload ={
            "method": "countdown",
            "count": "0:0"
        }
        connections.forEach(function(item){
            item.send(JSON.stringify(countPayload));
        });
    }

})
countDown();
function countDown(){
    addflag=true;
    //spin=-1;
    count=60;
    var x = setInterval(function(){
        console.log(count);
        
        let min = parseInt(count/60);
        let sec = count%60;
        const payload ={
            "method": "countdown",
            "count": min+":"+sec
        }
        connections.forEach(function(item){
            item.send(JSON.stringify(payload));
        });
    
        if(count<=10){
            addflag=false;
        }
    
    
        count-=1;
        if(count<0){
            
            
            clearInterval(x);
            resultSend();
            spinning = true;
            inSpinning();
            setTimeout(countDown,1000*60);
            
        }
    },1000);
}

function inSpinning(){
    spin=30;
    var x = setInterval(function(){
        spin-=1;
        console.log(spin);
        
        if(spin <= -3){
            if(queue.length===5){
                queue.shift();
                queue.push({"firstTile": slot1,"secondTile": slot2});
            }
            else{
                queue.push({"firstTile": slot1,"secondTile": slot2});
            }
            clearInterval(x);
            sendQueue();
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
