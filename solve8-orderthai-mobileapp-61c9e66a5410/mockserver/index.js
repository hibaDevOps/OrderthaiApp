const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//cors orgin enable
app.use(cors());
app.options('*', cors());
// parse requests of content-type: application/json
app.use(bodyParser.json());
app.use(express.static(__dirname));

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//compress with gzip all requests
app.use(compression());


require("./routes/app.routes.js")(app);

// set port, listen for requests
app.listen(3000,'192.168.1.103', () => {
  console.log("Server is running on port 3000.");
});