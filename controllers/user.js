const express = require('express');
const router = express.Router();
const jwt =	require('./../jwt.js'); 
const {secret} = require('./../config.js');
const {api_key} = require('./../config.js');
const {uploadPath} = require('./../config.js');
const {hackerrankUrl} = require('./../config.js');
const verifyToken = require('./../policies/jwtVerify.js');
const Request = require('request');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt-nodejs');

const User = require('./../models/user.js');
const Question = require('./../models/question.js');

router.post('/login',(req,res)=>{
	User.findOne({username:req.body.username},{username:1,password:1,_id:0},(err,data)=>{

		// Error Handler: 
		console.log("Login Request");
		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured."});
		}

		// Authorization Checker:

		if(!data || !bcrypt.compareSync(req.body.password,data.password)){
			return res.status(404).json({err:"Invalid Username/Password"});
		}

		// Return Token: 

		return res.status(200).json({msg:"Logged in",token:jwt.issueToken({id:data.username},secret,"1d")});
	});
});

router.post('/post',verifyToken,(req,res)=>{
	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);
	User.findOne({username:ddata.payload.id},(err,data)=>{

		// Error Handler: 

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

		// Question Handler: 

		Question.findOne({qnum:data.cqnum,diff:data.cdiff},(err,que)=>{
			if(err){
				return res.status(400).json({err:"Bad Request, Error Occured"});
			}

			// Save Submission Into Array:

			const extname = path.extname(req.files.code.path);
			const pathFile = uploadPath + '/' + data.username + '_' + que.qnum.toString() + diffStr + '_' + (new Date()).getTime() + extname;
			data.submissions.push(pathFile);
			if(!data.submissionc[que.qnum.toString() + diffStr.toString()]){
				data.submissionc[que.qnum.toString() + diffStr.toString()] = 1;
				console.log(data.submissionc);
				data.markModified('submissionc');
			}
			else{
				data.submissionc[que.qnum.toString() + diffStr.toString()] += 1;
				data.markModified('submissionc');
			}

			// Read Testcases: 

			const testcase = fs.readFileSync(que.testcase,{encoding:'utf-8',flag:'r'});
			const testcases = JSON.stringify([testcase]);

			// Read Code:

			const code = fs.readFileSync(req.files.code.path,{encoding:'utf-8',flag:'r'});

			// Save Uploaded File In Directory:

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
					if(body.result.stdout == null){
						data.save();
						return res.status(200).json({msg:"Compilation Error"});
					}
					else if(body.result.stdout[0] != que.testoutput){
						data.save();
						return res.status(200).json({msg:"Wrong Answer"});
					}
					else if(body.result.stdout[0] == que.testoutput){
						data.score += 1;
						data.csubmissions.push(pathFile);
						if(data.cdiff == 0 && data.cqnum == 0){
							data.cqnum = 1;
							data.save();
							Question.findOne({diff:0,qnum:1},(err,que)=>{
								if(err){
									data.cqnum = 0;
									data.score -= 1;
									data.save();
									return res.status(400).json({err:"Bad Request, Error Occured."});
								}
								data.start = new Date();
								data.save();
								return res.status(200).json({stmt:que.stmt,inputf:que.inputf,outputf:que.outputf,cnstr:que.cnstr,sinput:que.sinput,soutput:que.soutput,expln:que.expln,qnum:que.qnum,diff:que.diff});
							});
						}
						else{
							data.cqnum = -1;
							data.cdiff = -1;
							data.start = new Date(0);
							data.save();
							return res.status(200).json({msg:"Success"});
						} 
					}
				});
			});
		});                                                                                                                                                      
	});
});

router.get('/leaderboard',(req,res)=>{
	
	// Get Sorted List Of TeamNames Based on scores:

	User.find({},{username:1,score:1,_id:0},{sort:{score:-1}},(err,data)=>{
		
		// Error Handling:

		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured."});
		}
		console.log(data);

		// Return Data:

		return res.status(200).json({msg:"Success",data:data});
	});
});

router.get('/score',verifyToken,(req,res)=>{

	// Decode Token:

	var ddata = jwt.decodeToken(req.headers.authorization.split(' ')[1]);
	User.findOne({username:ddata.payload.id},{username:1,score:1,_id:0},(err,data)=>{
		
		// Error Handler:

		if(err){
			return res.status(400).json({err:"Bad Request, Error Occured."});
		}

		// Return Score:

		return res.status(200).json({msg:"Success",score:data.score,username:data.username});
	});
});

router.post('/create',(req,res)=>{
	User.create({username:req.body.username,password:bcrypt.hashSync(req.body.password)},(err,data)=>{
		console.log(err);
		console.log(data);
	});
});

module.exports = router;