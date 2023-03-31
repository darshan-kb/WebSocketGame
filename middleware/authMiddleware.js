const jwt = require('jsonwebtoken');
const User = require('../model/User');

const requireAuth = (req, res, next) =>{
    const token = req.cookies.jwt;

    console.log(req.cookies);
    //check json web token exists and verify

    if(token){
        jwt.verify(token,'pinto slot machine', (err, decodedToken)=>{
            //console.log("cookies from here");
            if(err){
                console.log(err.message);
                res.redirect('/login');
            }
            else{
                console.log(decodedToken);
                next();
            }
        });
    }
    else{
        res.redirect('/login');
    }
}

const checkUser = (req, res, next) =>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,'pinto slot machine', async (err, decodedToken)=>{
            if(err){
                //console.log(err.message);
                res.locals.useremail =null;
                res.locals.usertype =null;
                next();
            }
            else{
                //console.log(decodedToken);
                try{
                    let user = await User.findById(decodedToken.id);
                    res.locals.useremail = user.email;
                    res.locals.usertype = user.userType;
                }
                catch(err){
                    console.log(err);
                }
                next();
            }
        });
    }
    else{
        res.locals.useremail =null;
        res.locals.usertype =null;
        next();
    }
}

const adminCheck = (req, res, next) =>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,'pinto slot machine', async (err, decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/');
            }
            else{
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                if(user.userType == "admin"){
                    next();
                }
            }
        });
    }
    else{
        res.redirect('/');
    }
}

const loggedIn = (req, res, next) =>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,'pinto slot machine', async (err, decodedToken)=>{
            if(err){
                console.log(err.message);
                next();
            }
            else{
                res.redirect('/');
            }
        });
    }
    else{
        next();
    }
}

module.exports = {requireAuth, checkUser, adminCheck, loggedIn};