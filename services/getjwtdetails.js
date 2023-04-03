const User = require('../model/User');
const jwt = require('jsonwebtoken');

async function getemail(jwtcookie){
    for(cookie of jwtcookie){
        if(cookie.name == "jwt"){
            const token = cookie.value;
            //console.log(token);
            jwt.verify(token,'pinto slot machine', async (err, decodedToken)=>{
                try{
                    const user = await User.findById(decodedToken.id);
                    return user.email;
                    //console.log("email : "+email);
                }
                catch(error){
                    return "";
                }
                
            });
        }
    }
    return "";
}

module.exports = {getemail}