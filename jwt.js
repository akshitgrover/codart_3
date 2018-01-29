const jwt = require('jsonwebtoken');

var issueToken = (data,secret,time)=>{
	if(!data || !secret || !time){
		throw Error("Incomplete Details.");
	}
	var token = jwt.sign(data,secret,{expiresIn:time});
	return token;
}

var verifyToken = (token,secret)=>{
	if(!token || !secret){
		throw Error("Incomplete Details.");
	}
	return jwt.verify(token,secret);
}

var decodeToken = (token)=>{
	if(!token){
		throw Error("Incomplete Details.");
	}
	var decoded = jwt.decode(token,{complete:true});
	return decoded;
}

module.exports = {
 	issueToken,
    verifyToken,
 	decodeToken,
}