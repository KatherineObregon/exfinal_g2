const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

let app = express();
let servidorHttp = http.Server(app);
let socketio = socketIO(servidorHttp);

servidorHttp.listen(3000, function () {
    console.log("servidor levantado existosamente");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.get("/principal", function (req, res) {
    res.sendFile(__dirname + "/principal.html");
});

