const apl = require("./allpayload.js");
const payloadsend = require("./payloadsend.js");
const db = require("../config/db");
const tpdata = require("../services/tempdata.js");

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


module.exports = class result { 
    static async resultSend(allDataN,gameID){              //sending the result of the current game

        let tmp = [];
        let c=0;
        let sum = 0;
        for(let i=0;i<12;i++){
            sum+=Math.floor(dataArray[i]);
        }

        for(let i=0;i<36;i++){
            if(sum>=allDataN[i]){
                tmp[c++]=i;
            }
        }

        console.log(tmp);
        let winner = tmp[Math.floor(Math.random() * tmp.length)];
        let slot1 = winner%12;
        let slot2 = parseInt(winner/12);
        await db.updateresult(gameID,slot1,slot2);
        //console.log("sum = "+sum+" prize : "+allDataN[winner]);
        //await db.update_total_sum_reward(sum,allDataN[winner],gameID);
        //return this.prepareResult(slot1,slot2, gameID);
    }

    static async prepareResult(gameID){
        let res1 = [];
        let res2 = [];
        let c=0;
        let resd = await db.fetchresult(gameID);
        let slot1 = resd.slot1;
        let slot2 = resd.slot2;

        for(let i=0;i<12;i++){
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

        await db.update_total_sum_reward(gameID);

        return {"res1":res1, "res2": res2, "slot1": slot1, "slot2": slot2};
        //clearData();
    }

    static sendResultData(res1, res2, con){
        payloadsend.payLoadSendToAll(apl.result_payload(res1,res2),con);
    }

    static clearData(){
        for(let i=0;i<36;i++){
            allDataN[i]=0;
        }
        return allDataN;
    }
    
    
}