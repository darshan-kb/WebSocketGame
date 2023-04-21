const apl = require("./allpayload.js");
const payloadsend = require("./payloadsend.js")
const db = require("../config/db.js");

module.exports = class QueueOps{
    static async sendQueue(connections){               //sending the queue to the client
        
        let queue = await this.createQueue();
        //updateresultinDB();             // update the value of slot1 and slot2 in db
        payloadsend.payLoadSendToAll(apl.queue_payload(queue),connections);
    }

    static async createQueue(){
        const data = await db.findNdata();
        let queue = [];
        for(var d of data){
            if(d.slot1!=-1 && d.slot2!=-1){
                queue.push({"firstTile": d.slot1,"secondTile": d.slot2,"timestamp":d.timestamp.getHours() + ":" + d.timestamp.getMinutes()})
            }
        }

        return queue;
    }
    
}