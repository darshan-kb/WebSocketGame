const apl = require("./allpayload.js");
const payloadsend = require("./payloadsend.js")

module.exports = class QueueOps{
    static sendQueue(queue, slot1, slot2,connections,timestamp){               //sending the queue to the client
        
        if(queue.length===5){
            queue.shift();
        }
    
        queue.push({"firstTile": slot1,"secondTile": slot2,"timestamp":timestamp.getHours() + ":" + timestamp.getMinutes()});
        

        
        //updateresultinDB();             // update the value of slot1 and slot2 in db
        payloadsend.payLoadSendToAll(apl.queue_payload(queue),connections);
    }
    
}