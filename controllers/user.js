const express = require('express');
const router = express.Router();
const jwt =	require('./../jwt.js'); 
const {secret} = require('./../config.js');
const {api_key} = require('./../config.js');
const {uploadPath} = require('./../config.js');
const {hackerrankUrl} = require('./../config.js');
const verfiyToken = require('./../policies/jwtVerify.js');
const Request = require('request');
const path = require('path');
const fs = require('fs');

const User = require('./../models/user.js');
const Question = require('./../models/question.js');

router.post('/login',(req,res)=>{
	User.findOne({username:req.body.username},{username:1,password:1,_id:0},(err,data)=>{

		// Erro Handler: 

		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured."});
		}
		if(!data){
			return res.status(404).json({err:"Invalid Username/Password"});
		}
		if(data.password != req.body.password){
			return res.status(401).json({err:"Invalid Username/Password"});
		}

		// Return Token: 

		return res.status(200).json({msg:"Logged in",token:jwt.issueToken({id:data.username},secret,"1d")});
	});
});

router.post('/post',verfiyToken,(req,res)=>{
	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);
	User.findOne({username:ddata.payload.id},(err,data)=>{

		// Erro Handler: 

		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured"});
		}
		if(!data){
			return res.status(401).json({err:"Invalid Token"});
		}
		if(data.cqnum == -1){
			fs.unlinkSync(req.files.code.path);
			return res.status(400).json({err:"Request For A Question, No Active Question Yet."});
		}

		// Check For Difficulty:

		var diffStr;
		if(data.cdiff == 0){
			diffStr = 'B';
		}
		else if(data.cdiff == 1){
			diffStr = 'E';
		}
		else if(data.cdiff == 2){
			diffStr = 'M';
		}
		else{
			diffStr = 'H';
		}

		// Save Submission Into Array:

		data.submissions.push(data.cqnum.toString() + diffStr);

		// Question Handler: 

		Question.findOne({qnum:data.cqnum,diff:data.cdiff},(err,que)=>{
			if(err){
				return res.status(400).json({err:"Bad Request, Error Occured"});
			}

			// Read Testcases: 

			const testcase = fs.readFileSync(que.testcase,{encoding:'utf-8',flag:'r'});
			const testcases = JSON.stringify([testcase]);

			// Read Code:

			const code = fs.readFileSync(req.files.code.path,{encoding:'utf-8',flag:'r'});

			// Save Uploaded File In Directory:

			const extname = path.extname(req.files.code.path);
			const pathFile = uploadPath + '/' + data.username + '_' + que.qnum.toString() + diffStr + '_' + (new Date()).getTime() + extname;
			fs.rename(req.files.code.path,pathFile,(err)=>{
				if(err){
					console.log(err);
					return res.status(400).json({err:"Bad Request, Error Occured."});
				}
			
				// Check For Extensions: 

				var lang = -1;
				
				if(extname == '.py'){
					lang = 5;
				}
				else if(extname == '.cpp'){
					lang = 2;
				}
				else if(extname == '.c'){
					lang = 1;
				}
				else if(extname == '.java'){
					lang = 3;
				}
				else if(extname == '.js'){
					lang = 20;
				}
				else if(extname == '.rb'){
					lang = 8;
				}

				// Invalid File Format Checker:

				if(lang == -1){
					return res.status(400).json({err:"Invalid File Format"});
				}

				// Make A Request To HackerRank API:

				Request.post({url:hackerrankUrl,form:{source:code,lang:lang,testcases:testcases,api_key:api_key,wait:true,format:"json"}},(err,response,body)=>{
					if(err){
						return res.status(500).json({err:"Something Went Wrong."});
					}
					body = JSON.parse(body);
					console.log(body.result.stdout);
					if(body.result.stdout == null){
						data.save();
						return res.status(200).json({msg:"Wrong Answer"});
					}
					else if(body.result.stdout[0] == que.testoutput){
						data.score += 1;
						data.csubmissions.push(que.qnum + diffStr);
						if(data.cdiff == 0 && data.cqnum == 0){
							data.cqnum = 1;
							data.save();
						}
						else{
							data.cqnum = -1;
							data.cdiff = -1;
							data.save();
						} 
						return res.status(200).json({msg:"Success"});
					}
				});
			});
		});                                                                                                                                                      
	});
});

router.post('/create',(req,res)=>{
	User.create({username:req.body.username,password:req.body.password},(err,data)=>{
		console.log(err);
		console.log(data);
	});
});

module.exports = router;