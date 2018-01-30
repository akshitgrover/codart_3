const express = require('express');
const router = express.Router();
const verifyToken = require('./../policies/jwtVerify.js');
const jwt = require('./../jwt.js');

const Question = require('./../models/question.js');
const User = require('./../models/user.js');

router.post('/create',(req,res)=>{
	const qnum = req.body.qnum;
	const stmt = req.body.stmt;
	const inputf = req.body.inputf;
	const outputf = req.body.outputf;
	const sinput = req.body.sinput;
	const soutput = req.body.soutput;
	const expln = req.body.expln;
	const diff = req.body.diff;
	const testoutput = req.body.testoutput;
	var diffStr;
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
	const testcase = require('path').join(__dirname + "./../testcases/" + qnum.toString() + diffStr + '.txt');
	const que = {qnum,stmt,inputf,outputf,sinput,soutput,expln,diff,testcase,testoutput};
	Question.create(que,(err,data)=>{
		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured."});
		}
		return res.status(200).json({msg:"Create",que:data});
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
			return res.status(200).json({stmt:que.stmt,inputf:que.inputf,outputf:que.outputf,sinput:que.sinput,soutput:que.soutput,expln:que.expln,qnum:que.qnum,diff:que.diff});
		});
	});
});

router.post('/skip',verifyToken,(req,res)=>{
	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);
	User.findOne({username:ddata.payload.id},(err,data)=>{
		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured."});
		}
		if(new Date() - data.start >= 5000 && data.start - new Date(0) != 0){
			if(data.cdiff == 0 && data.cqnum == 0){
				data.cqnum = 1;
				Question.findOne({qnum:data.cqnum,diff:data.cdiff},(err,que)=>{
					if(err){
						return res.status(400).json({err:"Bad Request, Error Occured."});
					}
					data.start = new Date();
					data.save();
					return res.status(200).json({stmt:que.stmt,inputf:que.inputf,outputf:que.outputf,sinput:que.sinput,soutput:que.soutput,expln:que.expln,qnum:que.qnum,diff:que.diff});
				});
			}
			else{
				data.cqnum = -1;
				data.cdiff = -1;
				data.start = new Date(0);
				data.save(0);
				return res.status(200).json({msg:"Contact Administrator For New Question."});
			}
		}
		else if(new Date() - data.start < 5000){
			return res.status(200).json({msg:"Cannot Skip Right Now."});
		}
		else if(new Date(0) - data.start == 0){
			return res.status(200).json({msg:"Contact Administrator For New Question."});
		}
	});
});


module.exports = router;
