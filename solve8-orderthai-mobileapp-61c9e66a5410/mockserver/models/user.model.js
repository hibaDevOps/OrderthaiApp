const moment = require('moment');
const sql = require('./db.js');
const TokenGenerator = require('uuid-token-generator');

const User = function (user) {
    this.name = user.name;
    this.address = user.address;
    this.lat = user.lat;
    this.lng = user.lng;
    this.token = user.token;
    this.email = user.email;
    this.password = user.password;
    this.phone = user.phone;
    if (user.id) {
        this.id = user.id;
    }
    if (user.created_at) {
        this.created_at = user.created_at;
    }
    if (user.updated_at) {
        this.updated_at = user.updated_at;
    }
}

User.findByToken = (token, result) => {
    sql.query('SELECT * FROM users WHERE token = ?', token, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }
        result({ kind: "not_found" }, null);
    })
}
User.login = (req, result) => {
    sql.query('select * from users where email = ?', [req.email], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            sql.query('select * from users where email = ? and password = ?', Object.values(req), (err, res) => {
                if (res.length) {
                    const token = new TokenGenerator(512, TokenGenerator.BASE62);
                    let user = res[0];
                    user['token'] = token.generate();
                    user['mobile'] = user['phone'];
                    delete user['phone'];
                    sql.query('update users set token = ? WHERE id= ?',[user.token,user.id], (err, res) => {
                        console.log(req, err, res);
                        if(err){
                            result(err,null);
                        }else{
                            result(null, user);
                        }
                    })
                } else {
                    result(null, { message: 'Please enter correct email or password' })
                }
                return;
            });
        } else {
            result({ message: 'The email or password is incorrect or may inactive' },null );
        }
    })
}
User.add = (req, result) => {
    console.log(req.phone);
    let phone = req.phone;
    sql.query('SELECT * FROM users WHERE phone = ' + phone, (err, res) => {
        if (res.length) {
            result(null, { message: 'user already exist' });
            return;
        }
        if (res.length == 0) {
            let query = "INSERT INTO users SET ?";
            let params = req;
            params['created_at'] = moment().valueOf();
            params['updated_at'] = moment().valueOf();
            console.log(params);
            const myQuery = sql.query(query, params, (err, res) => {
                console.log(myQuery.sql);
                console.log(err, res.length);
                if (err) {
                    result(err, null);
                    return;
                }
                result(null, { message: 'inserted successfully' });
            });
        }
    });
}

module.exports = User;