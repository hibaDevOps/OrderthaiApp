const moment = require('moment');
const sql = require('./db.js');
var async = require('async');

const Order = function (order) {
    this.id = order.id;
    this.name = order.name;
    this.email = order.email;
    this.phone = order.phone;
    this.lat = order.lat;
    this.lng = order.lng;
    this.address = order.address;
    this.payment_method = order.payment_method;
    this.status = order.status;
    this.remaining_time = order.remaining_time;
    this.created_at = order.created_at;
}

Order.get = (req, result) => {
    const columns = [
        'id',
        'name',
        'address',
        'phone',
        'email',
        'payment_method',
        'status',
        'remaining_time',
        'created_at'
    ]
    sql.query('SELECT ??  FROM order_master WHERE restaurent_id = ?', [columns, req], (err, response) => {
        if (err) {
            result(err, null);
            return;
        }
        if (response.length) {
            response = response.map((item) => {
                return {
                    orderId: item.id,
                    orderStatus: item.status,
                    orderTime: item.created_at,
                    orderRemainingTime: item.remaining_time,
                    address: item.address
                };
            });
            console.log(response);
            result(null, response);
            return;
        }
        result(null, []);
    });
}
Order.addOrder = (req, result) => {
    const params = {
        ...req
    };
    params['remaining_time'] = params['remainingTime'];
    params['payment_method'] = params['paymentMethod'];
    params['phone'] = params['mobile'];
    params['delivery_note'] = params['deliveryNote'];
    delete params['remainingTime'];
    delete params['paymentMethod'];
    delete params['mobile'];
    delete params['deliveryNote'];
    console.log(params);
    params['created_at'] = moment().valueOf();
    let query = "INSERT INTO order_master SET ?";
    sql.query(query, params, (err, response) => {
        if (err) {
            result(err, null);
            return;
        }
        if (Object.keys(response).length > 0) {
            result(null, { message: 'Order added successfully' })
            return;
        }
        result(null, response);
    })
    // result(null,{message:'Record added successfully'});
}
Order.getOrderFromId = (req, user, result) => {
    sql.query('SELECT * FROM order_master WHERE id=? and restaurent_id = ?', [req.id, user], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length > 0) {
            const myOrder = res[0];
            myOrder['mobile'] = myOrder['phone'];
            myOrder['orderStatus'] = myOrder['status'];
            myOrder['orderTime'] = myOrder['created_at'];
            myOrder['paymentMethod'] = myOrder['payment_method'];
            myOrder['delivertNote'] = myOrder['delivery_note'];
            myOrder['orderId'] = myOrder['id'];
            myOrder['orderRemainingTime'] = myOrder['remaining_time'];
            delete myOrder['id'];
            delete myOrder['phone'];
            delete myOrder['status'];
            delete myOrder['created_at'];
            delete myOrder['payment_method'];
            delete myOrder['delivery_note'];
            delete myOrder['remaining_time'];
            delete myOrder['restaurent_id'];

            sql.query('select id,name,qty as quantity from order_items where order_id = ?', myOrder['orderId'], (err, dishes) => {
                if (dishes.length > 0) {
                    // dishes.map((item) => {
                    //     // sql.query('SELECT id,name,status FROM order_addons where order_item_id = ?', item['id'], (err, addons) => {
                    //     //     if (addons.length > 0) {
                    //     //         item['addOns'] = addons;
                    //     //     }
                    //     //     console.log(dishes);
                    //     // });
                    //     console.log(item);
                    // })
                    async.forEachOf(dishes, (item, i, dish_callback) => {
                        sql.query('SELECT id,name,status FROM order_addons where order_item_id = ?', item['id'], (err, addons) => {
                            if (addons.length > 0) {
                                dishes[i]['addOns'] = addons;
                                item['addOns'] = addons;
                            }
                            dish_callback(null);
                            if ((dishes.length - 1) == i) {
                                myOrder['order'] = dishes;
                                result(null, myOrder);
                            }
                        });
                    }, (err) => {
                        if (err) {
                            //handle the error if the query throws an error
                        } else {
                            //whatever you wanna do after all the iterations are done
                        }
                    });


                }
            })
            return;
        } else {
            result({ message: 'No record found' }, null);
            return;
        }
    })
    //result(null, req);
    return;
}

Order.updateStatus = (req, user, result) => {
    sql.query('UPDATE order_master SET status=? WHERE id=? and restaurent_id=?', [req.status, req.id, user], (err, response) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, { message: 'Updated' });
    })
}

Order.updateTime = (req, user, result) => {
    sql.query('UPDATE order_master SET remaining_time=? WHERE id=? and restaurent_id=?', [req.time, req.id, user], (err, response) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, { message: 'Updated' });
    })
}
module.exports = Order;