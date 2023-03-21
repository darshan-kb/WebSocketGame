 //Amount of money bet data add to array;
module.exports = class AddTempData{
    
    //Amount of money bet data add to array;
    static addData(data){  
        let allDataN=[];
        for(let i=0;i<27;i++){
            allDataN[i]=0;
        }                   
        for(let i=0;i<9;i++){
            let tmp=parseInt(data[i])
            allDataN[i] += tmp;
            allDataN[i+9] += tmp*2;
            allDataN[i+18] += tmp*3;
        }
        return allDataN;
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