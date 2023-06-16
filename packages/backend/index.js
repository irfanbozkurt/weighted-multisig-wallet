var express = require("express");
var fs = require("fs");
const https = require("https");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();

let transactions = {};

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.status(200).send("hello world");
});

app.get("/:key", function (req, res) {
  let key = req.params.key;
  res.status(200).send(transactions[key]);
});

app.post("/", function (request, response) {
  response.send(request.body);
  const key = request.body.address + "_" + request.body.chainId;
  if (!transactions[key]) {
    transactions[key] = {};
  }
  transactions[key][request.body.hash] = request.body;
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(49832, () => {
      console.log("HTTPS Listening: 49832");
    });
} else {
  var server = app.listen(49832, function () {
    console.log("HTTP Listening on port:", server.address().port);
  });
}
