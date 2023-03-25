const db = require("../config/db.js");
const User = require("../model/User.js");
const jwt = require("jsonwebtoken");


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

const maxAge = 24*60*60;
const createToken = (id) => {
    return jwt.sign({id}, 'pinto slot machine',{
        expiresIn: maxAge
    });
}



const items = [
    '🍉',
    '🍗',
    '🍭',
    '🍊',
    '⚔️',
    '🍹',
    '🍿',
    '🧨',
    '☀️',
];

const prize=[0,8,16,24];


module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.logout_get = (req, res) => {
    //const token = createToken();
    res.cookie('jwt', '', {maxAge:1});
    res.redirect('/');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.create({ email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge:maxAge*1000});
        res.status(201).json({user: user._id});
    }
    catch(err){
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
    //res.send('signup');
}

module.exports.login_post = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge:maxAge*1000});
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