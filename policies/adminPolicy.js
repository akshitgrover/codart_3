const jwt = require('./../jwt.js');
const {secret} = require('./../config.js');

var func = (req,res,next)=>{

	if(!req.headers.authorization){

		return res.status(401).json({err:"Token Absent"});

	}
	var arr = req.headers.authorization.split(' ');
	if(arr[0] != 'Bearer'){

		return res.status(401).json({err:"Invalid Token"});

	}
	if(!jwt.verifyToken(arr[1],secret)){

		return res.status(401).json({err:"Invalid Token"});

	}
	const ddata = jwt.decodeToken(arr[1]);
	if(ddata.payload.id != "admin"){
		
		return res.status(401).json({err:"Unauthorized"});

	}
	next();

}

module.exports = func;