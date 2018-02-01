const jwt = require('./../jwt.js');
const {secret} = require('./../config.js');

// Define Middleware

var func = (req,res,next)=>{

	// Error Handling

	if(!req.body.token){

		return res.status(401).json({err:"Token Absent"});

	}
	if(!jwt.verifyToken(req.body.token,secret)){

		return res.status(401).json({err:"Invalid Token"});

	}
	const ddata = jwt.decodeToken(req.body.token);
	if(ddata.payload.id != "admin"){
		
		return res.status(401).json({err:"Unauthorized"});

	}

	// If Passed Callback To Next Middleware

	next();

}

// Export Defined Middleware

module.exports = func;