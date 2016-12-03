var socket = io();
$("form").submit(function(){
	socket.emit("tomain message", $("#m").val());
	$('#m').val('');
	return false;
});

socket.on("frommain message", function(msg){
	$("#messages").append($("<li>").text(msg));
});
