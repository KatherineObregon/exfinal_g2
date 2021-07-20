const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

let app = express();
let servidorHttp = http.Server(app);
let socketio = socketIO(servidorHttp);

//mysql
const mysql = require("mysql2");
let conn = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "root",
        database: "exfinal_g2"
    }
);

servidorHttp.listen(3000, function () {
    console.log("servidor levantado existosamente");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.post('/', bodyParser.json(), function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    console.log(`Nombre: ${nombre}, Apellido: ${apellido}`);
    res.send(`Nombre: ${nombre}, Apellido: ${apellido}`);
});

app.get("/principal", function (req, res) {
    res.sendFile(__dirname + "/principal.html");
});

socketio.on("connection", function (webSocket) {

    console.log("usuario conectado c:")

    usuariosConectados = usuariosConectados + 1;
    socketio.emit("cantConect", usuariosConectados);
    var query1 = "select * from user "
    conn.query(query1, function (error, data) {
        if (error) throw error;
        let listaTotal = JSON.stringify(data);
        socketio.emit("listaTotal", listaTotal);


    });



    //mando historial de chat
    var query = "select * from messages "
        + "where date>(date_add(now(), interval -5 minute))";
    conn.query(query, function (error, data) {
        if (error) throw error;
        webSocket.emit("historial de chat", data);
    });

    var nombreUsuario = "desconocido";
    webSocket.on("establecer nombre de usuario", function (userName) {
        nombreUsuario = userName;
        listaUsuarios[listaUsuarios.length] = nombreUsuario;
        socketio.emit("listaUsuarios", listaUsuarios);
    });

    webSocket.on("mensaje de chat", function (msg) {
        //webSocket.emit("mostrar en chat",msg);
        //socketio.emit("mostrar en chat", msg);
        webSocket.broadcast.emit("mostrar en chat", nombreUsuario + ": " + msg);
        var query = "insert into messages(user, message, date) "
            + "values (?, ?,now())";
        var params = [nombreUsuario, msg];
        conn.query(query, params, function(error, data){
            if(error) throw error;
        });
    });

    webSocket.on("disconnect", function () {
        console.log("usario desconectado "
            + ":c\n------------------------------------");
        usuariosConectados = usuariosConectados - 1;
        socketio.emit("cantConect", usuariosConectados);

        //borrar al usuario
        listaUsuarios.forEach(function (usuario, index) {
            if (usuario === nombreUsuario) {
                listaUsuarios.splice(index, 1);
            }
        });

        socketio.emit("listaUsuarios", listaUsuarios);
    });

    webSocket.on("typing", function (typing) {
        var msg = {
            usuario: nombreUsuario,
            typing: typing
        }
        webSocket.broadcast.emit("typing", msg);
    });

    //cerrar sesión:
    webSocket.on("cerrar sesion", function(){
        webSocket.disconnect();
    });
})

