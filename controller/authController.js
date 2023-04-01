const db = require("../config/db.js");
const User = require("../model/User.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/sendEmail.js");
const crypto = require('crypto');


const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = {email:'', password:''};

    //incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'that email is not registered';
    }

    if(err.message === 'incorrect password'){
        errors.password = 'that password is incorrect';
    }

    if(err.code === 11000){
        errors.email = 'That email is already registered';
        return errors;
    }

    //validation errors
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties})=>{
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

//const maxAge = 24*60*60;
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}




const items = [
    '🍉',
    '🍗',
    '🍭',
    '🍆',
    '🍊',
    '⚔️',
    '🍹',
    '🌽',
    '🍿',
    '🧨',
    '☀️',
    '🛺',
  ];

  const recharge = ["100","500","1000","2000","5000","10000","20000","50000"]

const prize=[0,10,20,30];


module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.logout_get = (req, res) => {
    //const token = createToken();
    res.cookie('jwt', '', {maxAge:1});
    res.redirect('/login');
}
module.exports.home = (req, res) => {
    res.render('home');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.create({ email, password,balance:0,userType:"client"});
        res.status(200).json({signup: "Sign up successful"});
    }
    catch(err){
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.login_post = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge:24*60*60*1000});
        res.status(200).json({user: user._id});
    }
    catch(err){
        console.log(err);
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.report = (req, res) => {
    db.finddata().then(
        (result)=>{
            res.render('report', {pageTitle: 'welcome', result: result, items:items, prize:prize});
        }
    );
}

module.exports.slotmachine = (req, res) => {
    res.render('slotmachine');
}

module.exports.admin_get = (req, res) => {
    db.findalluser().then(
    (data) => {
        console.log(data);
        res.render('admin',{users: data, recharge: recharge});
    });
}

module.exports.admin_post = (req, res) => {
    console.log(req.body);

    db.rechargebalance(req.body).then((obj)=>{
        if(obj){
            res.status(200).json({status:"successfull"});
        }
        else{
            res.status(400).json({status:"failed"});
        }
    }) 
}

module.exports.forgotpassword_get = (req, res) => {
    res.render('forgotpassword');
}

module.exports.forgotpassword_post = async (req,res,next)=>{
    const {email} = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return next();
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `http://localhost:9998/resetpassword/${resetToken}`;
        
        const message=`
        <h1> You have requested a password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>`

        try{
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text:message
            });
            res.status(200).json({success:true, data:"Email sent"});
        }
        catch(err){
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;
            await user.save();
            console.log(handleErrors(err));
        }
    }
    catch(err){
        console.log(handleErrors(err));
    }
}

module.exports.resetpassword_get = (req, res) => {
    res.render('resetpassword');
}

module.exports.resetpassword_put = async (req, res)=>{
    console.log(req.params.resetToken);
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
    
    try{
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt: Date.now()}
        });
        console.log("I am here");
        if(!user){
            console.log("Invalid reset token");
            return
        }
        
        user.password = req.body.password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        res.status(200).json({success:true, data: "password reset successfully"});
        //res.redirect('/');
    }
    catch(err){
        console.log(handleErrors(err));
    }
}