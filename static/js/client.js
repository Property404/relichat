var socket = io.connect("https://45.55.195.156:3000", {secure:true});
$("form").submit(function(){
	socket.emit("tomain message", $("#m").val());
	$('#m').val('');
	return false;
});

socket.on("frommain message", function(msg){
	$("#messages").append($("<li>").text(msg));
});
