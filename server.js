// Packages Required

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');


// Functional Usage Of Packages

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


// Socket Definition

io.on("connection",(socket)=>{
	console.log("Connected");
});


// Set Views

app.set("views",path.join(__dirname + "/views"));
app.set("view engine","ejs");


// MongoDb Connection

mongoose.connect('mongodb://localhost:27017/codart_3',(err,db)=>{
	if(err){
		console.log("Error Connecting To MongoDb");
		process.exit(1);
	}
	console.log("Connected To MongoDb.");
});


// Lift Port Definition

server.listen(process.env.PORT || 3000);