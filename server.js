// Packages Required

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const multipart = require('connect-multiparty');


// Functional Usage Of Packages

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


// Parser Options

app.use(bodyParser.json());
app.use(multipart({uploadDir:path.join(__dirname + '/.tmp')}));

// Socket Definition

io.on("connection",(socket)=>{
	console.log("Connected");
	
});


// Set Views

app.set("views",path.join(__dirname + "/views"));
app.set("view engine","ejs");


// Routes

const user = require('./controllers/user.js');
app.use('/user',user);

const question = require('./controllers/question.js');
app.use('/question',question);


// MongoDb Connection

const {mongoUrl} = require('./config.js');

mongoose.connect(mongoUrl,(err,db)=>{
	if(err){
		console.log("Error Connecting To MongoDb");
		process.exit(1);
	}
	console.log("Connected To MongoDb.");
});


// Lift Port Definition

server.listen(process.env.PORT || 3000);