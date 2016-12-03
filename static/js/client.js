// Initialize variables
var username = "";
var keypair;

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

// On "go"
document.getElementById("goButton").onclick = function(){
	username = document.getElementById("username").value;
	if (validName(username)){
		// Generate RSA key pair
		generateAuthKey().then(function(key){
			keypair = key;
			
			// Sign in
			socket.emit("signin",
			{"username" : username,
			"keypair" : keypair.publicKey});

			// Allow use of chat
			$("form").submit(function(){

				/* Get message and sign */
				msg = $("#m").val();
				signature = "bla bla bla";
				socket.emit("tomain message", {"msg": msg, "signature": signature});
				$('#m').val('');
				return false;
			});

			socket.on("frommain message", function(data){
				$("#messages").append($("<li>").text(data.msg));
			});

			// Close modal
			console.log("Closing");
			$("#enterUserModal").modal("hide");
		});
	}else{
		alert("Invalid Username");
	}
}
	




