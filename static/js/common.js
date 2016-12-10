/* Functions shared by both client and server */
var Common = function() {
	var self = this;

	// Strip whitespace from username
	function stripUserName(uname) {
		return uname.trim();
	}

	// Is something a valid identifier?
	self.validUserName = function(uname, clients) {
		/* Strip username */
		uname.trim();

		/* Check if meets length qualifications */
		if (uname.length > 1 && uname != "main" && uname.length < 30) {

			/* Make sure username isn't already in use*/
			if (uname in clients) return false;
			return true;
		} else {
			return false;
		}
	};
};

module.exports = Common;
