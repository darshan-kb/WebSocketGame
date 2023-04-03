

module.exports = class PayloadSend{
    
    static findConnectionAndSend(clientID, payload, connections){
        console.log(connections);
        for(let c of connections){
            if(c.clientID === clientID){
                //console.log("found!");
                c.connection.send(JSON.stringify(payload));
            }
        }
    }
    
    static payLoadSendToAll(payload,connections){             //function to send payload to all the clients
        //console.log(connections);
        for(let con of connections){
            con.connection.send(JSON.stringify(payload));
        }
    }
}