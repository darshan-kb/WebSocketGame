
module.exports = class AllPayload{

    static con_array_payload(clientID, connection){
        const payload = {"clientID" : clientID, "connection": connection};
        return payload;
    }

    //This ticket data will be pushed to specific game
    static all_db_ticket_payload(clientID, ticketID,pdata){
        const ticketpayload ={
            "clientID" : clientID,
            "ticketID" : ticketID,
            "ticketdata": pdata,
            "dateandtime": new Date()
        }
        return ticketpayload;
    }

    //sending the ticket back to the client with ticketID
    static ticket_response_payload(ticketID,pdata,amt){
        const ticketpayload = {
            "method": "newticket",
            "ticketID": ticketID,
            "ticketdata": pdata,
            "balance": amt
        }
        return ticketpayload;
    }

    //This is send when client is connected for the first time.
    static init_payload(clientID,bal){
        const initpayload={
            "method": "init",
            "clientID": clientID,
            "balance": bal
        }
        return initpayload;
    }

    //This payload is sent when the game is spinning and we have to display countdown to 0:0
    static spin_count_payload(){
        const countPayload ={
            "method": "countdown",
            "count": "0:0"
        }
        return countPayload;
    }

    //send payload when client connected between the spinning
    static connect_between_game_payload(res1,res2,count){
        let payload={
            "method": "result",
            "res1": res1,
            "res2": res2,
            "spin": (parseInt(process.env.SPIN_TIME)+count)
        }
        return payload;
    }

    //sending result to the client
    static result_payload(res1, res2){
        let respayload ={
            "method": "result",
            "res1": res1,
            "res2": res2,
            "spin": process.env.SPIN_TIME
        }
        return respayload;
    }
    //create a payload to store in the Database at the start of the game
    static game_start_data(gameID,slot1,slot2,timestamp){
        const GameStartData = {
            "gameID" : gameID,
            "gameArray":[0,0,0,0,0,0,0,0,0,0,0,0],
            "slot1" : slot1,
            "slot2" : slot2,
            "timestamp": timestamp,
            "tickets" : []
        }
        return GameStartData;
    }

    //send countdown every second
    static send_count_payload(min,sec){
        const countpayload ={
            "method": "countdown",
            "count": min+":"+sec
        }
        return countpayload;
    }

    //Queue payload send once the client is connected or afte the result is declared.
    static queue_payload(queue){
        let sendqpayload = {
            "method": "displayQueue",
            "Queue": queue
        }
        return sendqpayload;
    }
    static balance_check_payload(amt){
        let sendbpayload = {
            "method": "balance",
            "balance": amt
        }
        return sendbpayload;
    }
}