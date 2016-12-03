// Initialize variables
var username = "";
var authkeypair;
var cryptkeypair;
var focus="main";
mainchat = [];//array of objects
privatechats = [];//array of objects, each containing arrays of objects lol lol lol

// set up sockets
var socket = io.connect("https://45.55.195.156:3000", {secure:true});


// Load sign in modal
$(window).on("load", function(){
	
	$("#enterUserModal").modal({"show":true, backdrop: 'static', keyboard: false});
});

// Is something a valid identifier?
function validName(uname){
	if (uname.length>2){
		return true;
	}else{
		return false;
	}
}
// string to array buffer
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// On "go"
document.getElementById("goButton").onclick = function(){
	username = document.getElementById("username").value;
	if (validName(username)){
		// Generate RSA key pair
		generateAuthKey().then(function(authkey){
			authkeypair = authkey;
			generateCryptKey().then(function(cryptkey){
			cryptkeypair = cryptkey
			// Sign in
			socket.emit("signin",
			{"username" : username,
			"pubauthkey" : authkeypair.publicKey,
			"pubcryptkey": cryptkeypair.publicKey});

			// Allow use of chat
			$("form").submit(function(){
				console.log("Submited");
				/* Get message*/
				msg = $("#m").val();
				console.log("Woo wee! About to sign! Can dooo!");
				console.log(authkeypair);
				/* Sign */
				window.crypto.subtle.sign(
					{
						name: "RSASSA-PKCS1-v1_5",
					},
					authkeypair.privateKey,
					str2ab(msg)
				).then(function(signature){
					console.log("'Bout to 'mit");
					
					if(true){
						console.log("Emitting main message");
						socket.emit("tomain message", {"msg":msg, "signature": signature});
					}else{
						console.log("Emitting private message");
					}
				}).catch(function(err){alert("Signing issue");console.log("NO");console.log(err);});
				console.log("Clearing");
				$('#m').val('');
				return false;
			});
			socket.on("update-users", function(users){
				$("#connectedUsers").empty();
				for(let user in users){
					$("#connectedUsers").append($("<button class='list-group-item'>").text(user));
				}
			});
			/* Recieve messages */
			socket.on("message", function(data){
				console.log("Incoming");
				/* Verify signature 
				console.log(data.pubauthkey);
				console.log(authkeypair.publicKey);
				window.crypto.subtle.verify(
					{
						name: "RSASSA-PKCS1-v1_5",
					},
					data.pubauthkey,
					data.signature,
					str2ab(msg)
				).then(function(isvalid){
					if(!isvalid){alert("INVALID SIGNATURE HOLY FUCK BALLS");}
					mainchat.push({"username":data.username, "msg":data.msg});
				}).catch(function(err){console.log(err)});
				*/
				var targetfocus;
				if(data.type == "main"){
					targetfocus = "main";
					mainchat.push({"username":data.username, "msg":data.msg});
				}else{
					targetfocus = data.username;
					privatechats[data.username].push(data.msg);
				}
				if(focus == targetfocus){	
					$("#messages").append($("<li>").text(data.username+":"+data.msg));
				}
			});

			// Close modal
			console.log("Closing");
			$("#enterUserModal").modal("hide");
		}).catch(function(err){alert("Gencryptkey err");console.log(err);});
		}).catch(function(err){alert("Genauthkey err");console.log(err);});
	}else{
		alert("Invalid Username");
	}
}
	




