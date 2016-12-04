var express = require("express");
var https = require("https");
var socketio = require("socket.io");
var fs = require("fs");
var sslOptions = {
	key: fs.readFileSync("newkey.pem"),
	cert: fs.readFileSync("cert.pem")
};
var clients = {};
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
	var pubauthkey;
	var pubcryptkey;
	socket.on("signin", function(data){
		console.log("User signing in...");
		username = data["username"];
		console.log(username);
		pubauthkey = data["pubauthkey"];
		console.log(pubauthkey.type);
		pubcryptkey = data["pubcryptkey"];
		clients[username] = {"pubauthkey":pubauthkey, "session": socket.id};
		io.sockets.emit("update-users", clients);
	});
	socket.on("tomain message", function(data){
		io.emit("message", {
			"type": "main",
			"username":username,
			"msg": data.msg,
			"pubauthkey":pubauthkey,
			"signature":data.signature});
		console.log("message: " + data.msg);
	});
	socket.on("toprivate message", function(data){
		console.log("PRIVATE");
		console.log(data.focus);
		var session = clients[data.focus].session;
		console.log(session);
		io.to(clients[data.focus].session).emit("message", {
			"type": "private",
			"username": username,
			"msg": data.msg,
			"pubauthkey":pubauthkey,
			"signature":data.signature});
		console.log("pm:" + data.msg);
		});
	socket.on("disconnect", function(){
		console.log("User disconnected");
		delete clients[username];
		io.sockets.emit("update-users", clients);
	});
});
const PORT=443;
server.listen(PORT, function(){
	console.log("Listening on "+PORT);
});
/*
http.listen(3000, function(){
	console.log("listening on *:3000");
});
*/
