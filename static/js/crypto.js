function generateAuthKey(){
	return window.crypto.subtle.generateKey({
		name: "RSA-PSS",
		modulusLength: 1024,
		publicExponent: new Uint8Array([0x01,0x00, 0x01]),
		hash: {name: "SHA-256"},
	},
	false, //don't allow exportKey
	["sign", "verify"]
	);
}
		
