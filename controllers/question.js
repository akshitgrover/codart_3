const express = require('express');
const router = express.Router();
const verifyToken = require('./../policies/jwtVerify.js');
const jwt = require('./../jwt.js');
const fs = require('fs');
const path = require('path');
const adminPolicy = require('./../policies/adminPolicy.js');

const Question = require('./../models/question.js');
const User = require('./../models/user.js');

router.post('/create',adminPolicy,(req,res)=>{

	const qnum = req.body.qnum;
	const stmt = req.body.stmt;
	const inputf = req.body.inputf;
	const outputf = req.body.outputf;
	const sinput = req.body.sinput;
	const soutput = req.body.soutput;
	const expln = req.body.expln;
	const diff = req.body.diff;
	var testoutput = req.body.testoutput;
	testoutput = testoutput.replace(/\r\n/g,'\n');
	const cnstr = req.body.cnstr;
	var diffStr;
	
	if(path.extname(req.files.testcase.name) != '.txt'){

		return res.status(400).json({err:"Invalid File Format."});
		
	}

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
	Question.findOne({qnum:qnum,diff:diff},(err,qf)=>{

		if(qf){
			return res.status(409).json({err:"Question Already Exists"});
		}

		const testcase = require('path').join(__dirname + "./../testcases/" + qnum.toString() + diffStr + '.txt');
		const que = {qnum,stmt,inputf,outputf,sinput,soutput,expln,diff,testcase,testoutput,cnstr};
		Question.create(que,(err,data)=>{
		
			if(err){
		
				return res.status(400).json({err:"Bad Request, Error Occured."});
		
			}
			const tupath = path.join(__dirname + '/../testcases/' + qnum + diffStr + '.txt');
			fs.renameSync(req.files.testcase.path,tupath);
			return res.status(200).json({msg:"Create",que:data});
		
		});

	});	

});

router.get('/question',verifyToken,(req,res)=>{
	
	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);
	User.findOne({username:ddata.payload.id},(err,data)=>{
	
		if(err){
	
			return res.status(400).json({err:"Bad Request, Error Occured."});
	
		}
		if(data.cqnum == -1){
	
			return res.status(400).json({err:"No Active Question Yet."});
	
		}
		if(data.start - new Date(0) == 0){
	
			var d = new Date();
			data.start = d;
			data.save();
	
		}
		Question.findOne({qnum:data.cqnum,diff:data.cdiff},(err,que)=>{
	
			if(err){
	
				return res.status(400).json({err:"Bad Request, Error Occured."});
	
			}
			return res.status(200).json({stmt:que.stmt,inputf:que.inputf,outputf:que.outputf,cnstr:que.cnstr,sinput:que.sinput,soutput:que.soutput,expln:que.expln,qnum:que.qnum,diff:que.diff});
	
		});
	
	});

});

router.post('/skip',verifyToken,(req,res)=>{

	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);

	User.findOne({username:ddata.payload.id},(err,data)=>{

		if(err){

			return res.status(400).json({err:"Bad Request, Error Occured."});

		}
		if(new Date() - data.start >= 1200000 && data.start - new Date(0) != 0){

			if(data.cdiff == 0){

				return res.status(400).json({err:"Cannot Skip Buffer Question."});

			}
			else{

				data.cqnum = -1;
				data.cdiff = -1;
				data.score -= 0.5;
				data.start = new Date(0);
				data.save(0);
				return res.status(200).json({msg:"Contact Administrator For New Question."});

			}
		}
		else if(new Date() - data.start < 1200000){

			return res.status(200).json({msg:"Cannot Skip Right Now."});

		}
		else if(new Date(0) - data.start == 0){

			return res.status(200).json({msg:"Contact Administrator For New Question."});

		}

	});

});


module.exports = router;
