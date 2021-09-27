const User = require('../models/user.model.js');

exports.login = (req, res) => {
    console.log(req);
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }
    User.login(req.body, (err, data) => {
        if(err){
            res.status(400).send(err);
        }
        else{
            res.status(200).send(data);
        }
    });
}