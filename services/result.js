const apl = require("./allpayload.js");
const payloadsend = require("./payloadsend.js");

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


    static resultSend(allDataN,con,res1,res2,slot1,slot2){              //sending the result of the current game
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

    

        // let respayload ={
        //     "method": "result",
        //     "res1": res1,
        //     "res2": res2,
        //     "spin": 30
        // }
        payloadsend.payLoadSendToAll(apl.result_payload(res1,res2),con);
        return {"res1":res1, "res2": res2, "slot1": slot1, "slot2": slot2};
        //clearData();
    }

    static clearData(){
        for(let i=0;i<27;i++){
            allDataN[i]=0;
        }
        return allDataN
    }
    
    
}