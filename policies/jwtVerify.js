var jwt = require('./../jwt.js');
var {secret} = require('./../config.js');

// Export Middleware

module.exports = (req,res,next)=>{

	// Error Handling

	if(!req.headers.authorization){

		return res.status(401).json({err:"Token Absent."});

	}
	var arr = req.headers.authorization.split(' ');
	if(arr[0] != "Bearer"){

		return res.status(401).json({err:"Invalid Token"});
	
	}
	if(!jwt.verifyToken(arr[1],secret)){
	
		return res.status(401).json({err:"Invalid Token"});
	
	}

	// Callback To Next Middleware

	next();
	
}