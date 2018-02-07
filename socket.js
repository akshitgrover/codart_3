const socketIO = require('socket.io');
const jwt = require('./jwt.js');
const {secret} = require('./config.js');

const User = require('./models/user.js');
const Question = require('./models/question.js');

// Define Class For User

class user{
	constructor(username,socketid,easyi,medi,hardi,dqnum){
		this.username = username,
		this.socketid = socketid,
		this.easyi = easyi;
		this.medi = medi;
		this.hardi = hardi;
		this.dqnum = dqnum;
	}
}

// Local Variables

var admin = [];
var objs = {};
var obju = {};

// Create Socket Driver Function

const socketFunc = (io)=>{

	io.on('connection',(socket)=>{
		
		// Join Event

		socket.on('join',(token,cb)=>{

			// Verify Token

			if(!jwt.verifyToken(token,secret)){

				return cb({err:"Unauthorized."});

			}

			// Decode Token

			var ddata = jwt.decodeToken(token);

			// Find User

			User.findOne({username:ddata.payload.id},(err,data)=>{

				//Error Handling

				if(err){
				
					return cb({err:"Error Occured."});

				}

				if(obju[data.username]){

					console.log(data.username + "Already Connected.");
					io.sockets.sockets[socket.id].disconnect();
					return cb({err:"Already Joined."});
					
				}

				// Store Token

				objs[socket.id] = ddata.payload.id;

				// Define User Object

				obju[ddata.payload.id] = new user(ddata.payload.id,socket.id,data.easyi,data.medi,data.hardi,data.dqnum);
				
				// Fire Console Log Statement

				console.log(objs[socket.id] + " Connected.");

			});

		});

		// Admin Join Event
		
		socket.on('adminjoin',(token,cb)=>{

			// Decode Token

			var ddata = jwt.decodeToken(token);

			// Error Handling

			if(!jwt.verifyToken(token,secret) && ddata.payload.id != "admin"){

				return cb({err:"Unauthorized."});

			}

			// Fire Console Event

			console.log("Admin Joined.");

			// Store Admin Socket.id

			admin.push(socket.id);

		});

		// Define giveQuestion Event

		socket.on('giveQuestion',(username,diff,cb)=>{
			
			// Find If User Active

			const aidx = admin.indexOf(socket.id);

			// Error Handling

			if(aidx == -1){
			
				return cb({err:"Unauthorized"});
			
			}

			// Find User

			var u = obju[username];
			
			// Error Handing

			if(!u){
				return cb({err:"No User Found."});
			}

			// Find Question Number

			var qnum;
			if(diff == 1){

				qnum = u.easyi;

			}
			else if(diff == 2){

				qnum = u.medi;

			}
			else if(diff == 3){

				qnum = u.hardi;

			}

			// See If Question Number Exists

			if(qnum > 10){
				return cb({err:"Cannot Give More Questions, Of This Difficulty."});
			}

			// Find Question

			Question.findOne({qnum:qnum,diff:diff},(err,que)=>{

				// Error Handling

				if(err){
					
					return cb({err:"Error Occured."});
				
				}

				// Define Question Object

				var obj = {stmt:que.stmt,inputf:que.inputf,outputf:que.outputf,cnstr:que.cnstr,sinput:que.sinput,soutput:que.soutput,expln:que.expln,qnum:que.qnum,diff:que.diff}
				
				// Find User

				User.findOne({username:username},(err,uf)=>{

					// Error Handling

					if(err){
					
						return cb({err:"Error Updating Question, Username: " + username + " Diff: " + que.diff});
					
					}
					if(uf.cqnum != -1 && uf.cdiff != -1){

						return cb({err:"Active Question Exists, Either Skip Or Submit."});
					
					}

					// Emit Question To Specific User

					obj["qnum"] = uf.dqnum;
					io.to(obju[username].socketid).emit('question',obj);

					// Acknowledge Question Emit In Console
					console.log("Emitted Question: " + que.qnum + " Diff: " + que.diff + " For: " + username);
					
					// Update Question In Local Variables

					if(diff == 1){

						uf.easyi += 1;
						obju[username].easyi += 1;

					}
					else if(diff == 2){

						uf.medi += 1;
						obju[username].medi += 1;

					}
					else if(diff == 3){
					
						uf.hardi += 1;
						obju[username].hardi += 1;
					
					}

					// Update User In Database

					uf.cqnum = qnum;
					uf.dqnum += 1;
					uf.cdiff = diff;
					uf.start = new Date();
					uf.save();

				});

			});

		});

		// Define Socket Disconnect Event

		socket.on('disconnect',()=>{

			// Find If Socket.id Exists

			const aidx = admin.indexOf(socket.id);

			// Error Handling

			if(aidx != -1){

				admin.splice(aidx);
				
				// Acknowledge In Console (admin disconnect)

				console.log("Admin Disconnected, Logged in: " + admin.length);

			}
			else if(objs[socket.id]){

				// Acknowledge In Console (user disconnect)

				console.log(objs[socket.id] + " Disconnected.");
				delete obju[objs[socket.id]];
				delete objs[socket.id];

			}

		});

	});
}

module.exports = socketFunc;