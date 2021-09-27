const User = require('../models/user.model.js');

exports.adduser = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }
    // res.status(200).send(req.body);
    User.add(req.body, (err, data) => {
        if (err) {
            res.status(500).send({ message: 'Something went wrong', error: err });
        }
        else {
            res.status(200).send(data);
        }
    });
}