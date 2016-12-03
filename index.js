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
	var username;
	var pubkey;
	socket.on("signin", function(data){
		console.log("User signing in...");
		username = data["username"];
		pubkey = data["pubkey"];
	});
	socket.on("tomain message", function(data){
		io.emit("frommain message", {
			"username":username,
			"msg": data.msg,
			"publickey":pubkey,
			"signature":data.signature});
		console.log("message: " + data.msg);
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
