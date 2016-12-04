// Initialize variables
var username = "";
var focus="main";
mainchat = {"new":0, "messages":[]};//array of objects
users = {}
privatechats = {};//array of objects, each containing arrays of objects lol lol lol

// set up sockets
var socket = io.connect("https://45.55.195.156", {secure:true});


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

// Add private chat
function addPrivateChat(str){
	if(!(str in privatechats) && str!="main"){
		privatechats[str] = {"messages":[], "new":0};
	}
}
function updatePrivateChats(){
	$("#privateChats").empty();
	$("#privateChats").append($("<li class='list-group-item' style='font-weight: "+(focus=="main"?"bold":"normal")+";' onclick='changeFocus(\"main\")'>").text("Main Chat"));
	for (let chat in privatechats){
		$("#privateChats").append($("<li "+(focus==chat?"style='font-weight: bold;'":"")+"class='list-group-item' onclick='changeFocus(\""+chat.replace("\\","\\\\").replace("\"","\\\"")+"\")'>").text(chat+(privatechats[chat]["new"]?"("+privatechats[chat]["new"]+")":"")));
	}
}
function updateMessages(messages){
	$("#messages").empty();
	for(let i of messages){
		$("#messages").append($("<li>").text(i.username+":"+i.msg));
		console.log(i);
	}
}	
// Change focus
function changeFocus(str){
	console.log("Changing Focus!");
	focus = str;
	addPrivateChat(focus);
	updatePrivateChats();
	if(focus=="main"){
		updateMessages(mainchat.messages);
	}else{
		updateMessages(privatechats[focus].messages);
	}	
	console.log(focus);
	privatechats[focus]["new"] = 0;
}
// On "go"
document.getElementById("goButton").onclick = function(){
	username = document.getElementById("username").value;
	if (validName(username)){
			// Sign in
			socket.emit("signin",
			{"username" : username });
			
			updatePrivateChats();
			// Allow use of chat
			$("form").submit(function(){
				console.log("Submited");
				/* Get message*/
				msg = $("#m").val();
					console.log("'Bout to 'mit");
					
					if(focus=="main"){
						console.log("Emitting main message");
						socket.emit("tomain message", {"msg":msg});
					}else{
						console.log("Emitting private message");
						socket.emit("toprivate message", {"focus":focus, "msg":msg});
						privatechats[focus].messages.push({"username":username, "msg":msg});
						$("#messages").append($("<li>").text(username+":"+msg));
					}
				console.log("Clearing");
				$('#m').val('');
				return false;
			});
			
			socket.on("update-users", function(users){
				$("#connectedUsers").empty();
				for(let user in users){
					$("#connectedUsers").append($("<li class='list-group-item'>").text(user).prepend("<span class='fa fa-comment-o' align='right' onclick='changeFocus(\""+user.replace("\\","\\\\").replace("\"","\\\"")+"\")'>&nbsp;&nbsp;</span>"));
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
					mainchat["messages"].push({"username":data.username, "msg":data.msg});
				}else{
					targetfocus = data.username;
					if (!(data.username in privatechats)){
						console.log("School yo");
						privatechats[data.username]={"messages":[], "new":0};
											}
					privatechats[data.username].messages.push({"username": data.username, "msg":data.msg});
				}
				if(focus == targetfocus){	
					$("#messages").append($("<li>").text(data.username+":"+data.msg));
				}else{
					privatechats[data.username]["new"] += 1;
				}
				updatePrivateChats();

			});

			// Close modal
			console.log("Closing");
			$("#enterUserModal").modal("hide");
	}else{
		alert("Invalid Username");
	}
}
	




