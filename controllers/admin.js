const express = require('express');
const router = express.Router();
const Admin = require('./../models/admin.js');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('./../jwt.js');
const adminPolicy  = require('./../policies/adminPolicy.js');
const {secret} = require('./../config.js');

router.post('/create',adminPolicy,(req,res)=>{

	// Create Admin

	Admin.create({username:req.body.username,password:bcrypt.hashSync(req.body.password)},(err,data)=>{
		
		// Error Handling

		if(err){

			return res.status(400).json({err:"Bad Request, Error Occured."});
		
		}

		// Send Response

		return res.status(200).json({msg:"Success"});
	});

});

router.get('/login',(req,res)=>{

	// Render Login Form

	res.render('admin/login');

});

router.post('/login',(req,res)=>{

	// Find Admin

	Admin.findOne({username:req.body.username},(err,data)=>{

		// Error Handling

		if(err){

			return res.status(400).json({err:"Bad Request, Error Occured."});

		}
		if(!data || !bcrypt.hashSync(req.body.password,data.password)){

			return res.status(401).json({err:"Invalid Username/Password"});
		
		};	

		// Return Response

		return res.render('admin/panel',{msg:"Logged In",token:jwt.issueToken({id:"admin"},secret,"1d")});

	});

});

router.get('/logout',(req,res)=>{

	// Redirect To Login Form

	res.redirect('/admin/login');

});

module.exports = router;