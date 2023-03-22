 //Amount of money bet data add to array;
module.exports = class AddTempData{
    
    //Amount of money bet data add to array;
    static addData(data,allDataN){  
        // let allDataN=[];
        // for(let i=0;i<27;i++){
        //     allDataN[i]=0;
        // }                   
        for(let i=0;i<9;i++){
            allDataN[i] += data[i]*8;
            allDataN[i+9] += data[i]*16;
            allDataN[i+18] += data[i]*24;
        }
        //return allDataN;
    }

    //remove the values which has 0 in it
    static preprocessdata(data){
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
}