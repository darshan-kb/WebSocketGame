const db = require("../config/db.js");
const User = require("../model/User.js");
const handleErrors = (err) => {
    console.log(err.message, err.code)
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

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.create({ email, password});
        res.status(201).json(user);
    }
    catch(err){
        handleErrors(err);
        res.status(400).send('error, user not created');
    }
    //res.send('signup');
}

module.exports.login_post = (req, res) => {
    res.send('login');
}

module.exports.report = (req, res) => {
    db.finddata().then(
        (result)=>{
            res.render('pages/report', {pageTitle: 'welcome', result: result, items:items, prize:prize});
        }
    );
}

module.exports.slotmachine = (req, res) => {
    res.render('slotmachine');
}