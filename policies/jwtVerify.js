var jwt = require('./../jwt.js');
var {secret} = require('./../config.js');

module.exports = (req,res,next)=>{

	var arr = req.headers.authorization.split(' ');
	if(arr[0] != "Bearer"){
		return res.status(401).json({err:"Invalid Token"});
	}
	if(!jwt.verifyToken(arr[1],secret)){
		return res.status(401).json({err:"Invalid Token"});
	}
	next();
	
}