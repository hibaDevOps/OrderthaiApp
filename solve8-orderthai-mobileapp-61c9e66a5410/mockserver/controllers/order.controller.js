const Order = require('../models/order.model.js');
const Auth = require('../models/user.model.js');

exports.getorders = (req, result) => {
    console.log(req.headers.accesstoken);
    Auth.findByToken(req.headers.accesstoken, (err, user) => {
        if (err) {
            result.status(401).send({ message: 'User unauthorised' });
            return;
        }
        if (Object.keys(user).length > 0) {
            Order.get(user.id, (err, order) => {
                if (err) {
                    result.status(500).send(err);
                    return;
                }
                result.status(200).send(order);
            });
        }
    })
}

exports.addOrders = (req, result) => {
    Auth.findByToken(req.headers.accesstoken, (err, user) => {
        if (err) {
            result.status(401).send({ message: 'User unauthorised' });
            return;
        }
        if (Object.keys(req.body).length == 0) {
            result.status(400).send({ message: 'Content can not be empty!' });
            return;
        }
        let request = req.body;
        request['restaurent_id'] = user.id;
        Order.addOrder(req.body, (err, order) => {
            if (err) {
                result.status(500).send(err);
                return;
            }
            if (Object.keys(order).length == 0) {
                result.status(500).send({ message: 'Something went wrong' });
                return;
            }
            else {
                result.status(200).send({ message: 'Order added successfully' });
                return;
            }
        })
    });
}

exports.getOrderFromId = (req, result) => {
    Auth.findByToken(req.headers.accesstoken, (err, user) => {
        if (err) {
            result.status(401).send({ message: 'User unauthorised' });
            return;
        }
        Order.getOrderFromId(req.params, user.id, (err, res) => {
            if (err) {
                result.status(500).send(err);
                return;
            }
            result.status(200).send(res);
        });
    });
}
exports.updateStatus = (req, result) => {
    Auth.findByToken(req.headers.accesstoken, (err, user) => {
        if (err) {
            result.status(401).send({ message: 'User unauthorised' });
            return;
        }
        Order.updateStatus(req.body, user.id, (err, res) => {
            if (err) {
                result.status(500).send(err);
                return;
            }
            result.status(200).send(res);
        })
    });
}

exports.updateTime = (req, result) => {
    Auth.findByToken(req.headers.accesstoken, (err, user) => {
        if (err) {
            result.status(401).send({ message: 'User unauthorised' });
            return;
        }
        Order.updateTime(req.body, user.id, (err, res) => {
            if (err) {
                result.status(500).send(err);
                return;
            }
            result.status(200).send(res);
        })
    });
}