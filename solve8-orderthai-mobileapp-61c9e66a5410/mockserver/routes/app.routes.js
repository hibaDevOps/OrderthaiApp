module.exports = app => {
        const auth = require('../controllers/auth.controller.js');
        const user = require('../controllers/user.controller.js');
        const order = require('../controllers/order.controller.js');
        app.post('/login',auth.login);
        app.post('/adduser',user.adduser);
        app.post('/order',order.addOrders);
        app.get('/order',order.getorders);
        app.get('/order/:id',order.getOrderFromId);
        app.put('/order/status',order.updateStatus);
        app.put('/order/time',order.updateTime);
};