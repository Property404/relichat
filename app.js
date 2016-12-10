// Imports
var express = require("express");
var https = require("https");
var socketio = require("socket.io");
var fs = require("fs");

// TLS keys
var sslOptions = {
    key: fs.readFileSync("newkey.pem"),
    cert: fs.readFileSync("cert.pem")
};

// Create app and server
var app = express();
server = https.createServer(sslOptions, app);


// Global vars
var clients = {}; //List of clients according to username

// Static HTML, JS, and CSS files
app.use("/static", express.static("./static"));

// Main page (main chat)
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

// Chat server
io = socketio.listen(server, {
    "log level": 3,
    "match origin protocol": true,
    "transports": ["polling", 'websocket']
});

// When one user connects
io.on("connection", function(socket) {
    console.log("a user connected");
    var username;

    /* Client sends a signin request */
    socket.on("signin", function(data) {
        console.log("User signing in...");
        username = data["username"];
        clients[username] = {
            "session": socket.id
        };
        io.sockets.emit("update-users", clients);

        socket.on("tomain message", function(data) {
            io.emit("message", {
                "type": "main",
                "username": username,
                "msg": data.msg,
                "signature": data.signature
            });
            console.log("message: " + data.msg);
        });
        socket.on("toprivate message", function(data) {
            console.log("PRIVATE");
            console.log(data.focus);
            try {
                var session = clients[data.focus].session;
                console.log(session);
                io.to(clients[data.focus].session).emit("message", {
                    "type": "private",
                    "username": username,
                    "msg": data.msg
                });
                console.log("pm:" + data.msg);
            } catch (err) {
                console.log("err" + err);
            }
        });
        socket.on("disconnect", function() {
            console.log("User disconnected");
            delete clients[username];
            io.sockets.emit("update-users", clients);
        });
    });
});
const PORT = 443;
server.listen(PORT, function() {
    console.log("Listening on " + PORT);
});
