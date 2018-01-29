const express = require('express');
const router = express.Router();

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
	else if(cdiff == 1){
		diffStr = 'E';
	}
	else if(cdiff == 2){
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

module.exports = router;
