const express = require('express');
const router = express.Router();
const verifyToken = require('./../policies/jwtVerify.js');
const jwt = require('./../jwt.js');
const fs = require('fs');
const path = require('path');
const adminPolicy = require('./../policies/adminPolicy.js');

const Question = require('./../models/question.js');
const User = require('./../models/user.js');

var io;

var func = (res)=>{

	io = res;

}

// Create Question

router.post('/create',adminPolicy,(req,res)=>{

	// Object Marshalling

	const qnum = req.body.qnum;
	const stmt = req.body.stmt;
	const inputf = req.body.inputf;
	const outputf = req.body.outputf;
	const sinput = req.body.sinput;
	const soutput = req.body.soutput;
	const expln = req.body.expln;
	const diff = req.body.diff;
	const cnstr = req.body.cnstr;
	var diffStr;
	
	// Error Handling:

	if(!req.files.testcase || !req.files.testoutput){
		return res.status(400).json({err:"No File Selected."});
	}
	if(path.extname(req.files.testcase.name) != '.txt' || path.extname(req.files.testoutput.name) != '.txt'){

		return res.status(400).json({err:"Invalid File Format."});
		
	}

	// Difficulty Checking

	if(diff == 0){

		diffStr = 'B';
	
	}
	else if(diff == 1){
	
		diffStr = 'E';
	
	}
	else if(diff == 2){
	
		diffStr = 'M';
	
	}
	else{
	
		diffStr = 'H';
	
	}

	// Finding Question

	Question.findOne({qnum:qnum,diff:diff},(err,qf)=>{

		if(qf){
			return res.status(409).json({err:"Question Already Exists"});
		}

		// Upload TestCase File

		const testcase = require('path').join(__dirname + "/../testcases/" + qnum.toString() + diffStr + '.txt');
		const testoutput = require('path').join(__dirname + "/../testoutputs/" + qnum.toString() + diffStr + '.txt');
		const que = {qnum,stmt,inputf,outputf,sinput,soutput,expln,diff,testcase,testoutput,cnstr};
		
		// Create Question

		Question.create(que,(err,data)=>{
		
			if(err){
		
				return res.status(400).json({err:"Bad Request, Error Occured."});
		
			}

			// Path For Uploaded File

			const tupath = path.join(__dirname + '/../testcases/' + qnum + diffStr + '.txt');
			const toupath = path.join(__dirname + '/../testoutputs/' + qnum + diffStr + '.txt');
			fs.renameSync(req.files.testcase.path,tupath);
			fs.renameSync(req.files.testoutput.path,toupath);

			// Give Response

			return res.status(200).json({msg:"Create",que:data});
		
		});

	});	

});

router.get('/question',verifyToken,(req,res)=>{
	
	// Decode Token

	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);
	User.findOne({username:ddata.payload.id},(err,data)=>{
	
		// Error Handling

		if(err){
	
			return res.status(400).json({err:"Bad Request, Error Occured."});
	
		}
		if(data.cqnum == -1){
	
			return res.status(400).json({err:"No Active Question Yet."});
	
		}

		// Setting Start Timer Of Question

		if(data.start - new Date(0) == 0){
	
			var d = new Date();
			data.start = d;
			data.save();
	
		}

		// Find Question

		Question.findOne({qnum:data.cqnum,diff:data.cdiff},(err,que)=>{
	
			// Error Handling

			if(err){
	
				return res.status(400).json({err:"Bad Request, Error Occured."});
	
			}

			// Send Question Response

			return res.status(200).json({stmt:que.stmt,inputf:que.inputf,outputf:que.outputf,cnstr:que.cnstr,sinput:que.sinput,soutput:que.soutput,expln:que.expln,qnum:data.dqnum,diff:que.diff});
	
		});
	
	});

});

router.post('/skip',verifyToken,(req,res)=>{

	// Decode Token

	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);

	// Find User

	User.findOne({username:ddata.payload.id},(err,data)=>{

		// Error Handling

		if(err){

			return res.status(400).json({err:"Bad Request, Error Occured."});

		}

		if(data.cdiff == 0){
			return res.status(200).json({msg:"Cannot Skip Buffer Question."});
		}

		// Checking Eligibility To Skip

		if(new Date() - data.start >= 60000 && data.start - new Date(0) != 0){

			data.cqnum = -1;
			data.cdiff = -1;
			data.score -= 0.5;
			data.start = new Date(0);
			data.save().then(()=>{

				User.find({},{username:1,score:1,_id:0},{sort:{score:-1}},(err,uscore)=>{

					if(err){
					
						console.log("Error Occured, While Fetching To Emit Score.");
						return;
					
					}
					io.emit('score',uscore);
				
				});
			
			});
			return res.status(200).json({msg:"Contact Administrator For New Question.",flag:-1});

		}
		else if(new Date() - data.start < 60000){

			return res.status(200).json({msg:"Cannot Skip Right Now."});

		}
		else if(new Date(0) - data.start == 0){

			return res.status(200).json({msg:"Contact Administrator For New Question.",flag:-1});

		}

	});

});


module.exports = {

	router,
	func

}