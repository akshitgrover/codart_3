const express = require('express');
const router = express.Router();
const Admin = require('./../models/admin.js');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('./../jwt.js');
const {secret} = require('./../config.js');


router.post('/create',(req,res)=>{

	Admin.create({username:req.body.username,password:bcrypt.hashSync(req.body.password)},(err,data)=>{
		
		if(err){

			return res.status(400).json({err:"Bad Request, Error Occured."});
		
		}
		return res.status(200).json({msg:"Success"});
	});

});

router.post('/login',(req,res)=>{

	Admin.findOne({username:req.body.username},(err,data)=>{

		if(err){

			return res.status(400).json({err:"Bad Request, Error Occured."});

		}
		if(!data || !bcrypt.hashSync(req.body.password,data.password)){

			return res.status(401).json({err:"Invalid Username/Password"});
		
		};	
		return res.status(200).json({msg:"Logged In",token:jwt.issuToken({id:"admin"},secret,"1d")});

	});

});

module.exports = router;