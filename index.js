var express = require("express");
var https = require("https");
var socketio = require("socket.io");
var fs = require("fs");
var sslOptions = {
	key: fs.readFileSync("newkey.pem"),
	cert: fs.readFileSync("cert.pem")
};
var app = express();
server = https.createServer(sslOptions, app);
app.use("/static", express.static("./static"));
app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
});
io = socketio.listen(server, {
	"log level" : 3,
	"match origin protocol": true,
	"transports": ["polling", 'websocket']
});
io.on("connection", function(socket){
	console.log("a user connected");
	socket.broadcast.emit("hi friend");
	socket.on("tomain message", function(msg){
		io.emit("frommain message", msg);
		console.log("message: " + msg);
	});
	socket.on("disconnect", function(){
		console.log("User disconnected");
	});
});

server.listen(3000);
/*
http.listen(3000, function(){
	console.log("listening on *:3000");
});
*/
