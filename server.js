// Packages Required

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const multipart = require('connect-multiparty');
const cors = require('cors');
const socketIO = require('socket.io');


// Functional Usage Of Packages

const app = express();
const server = http.createServer(app);
app.use(cors());

// Parser Options

app.use(bodyParser.json());
app.use(multipart({uploadDir:path.join(__dirname + '/.tmp')}));

// Socket Definition

const io = socketIO(server);

const {socketFunc} = require('./socket.js');
socketFunc(io);

const userFunc = require('./controllers/user.js').func;
userFunc(io);

const questionFunc = require('./controllers/question.js').func;
questionFunc(io);


// Set Views

app.set("views",path.join(__dirname + "/views"));
app.set("view engine","ejs");


// Static Directory

app.use(express.static(path.join(__dirname + '/assets')));

// Routes

/* Backend Testing Routes */

app.use('/ur',(req,res,next)=>{res.render('uindex')});
app.use('/ar',(req,res,next)=>{res.render('aindex')});

/* API Routes */

const user = require('./controllers/user.js').router;
app.use('/user',user);

const question = require('./controllers/question.js').router;
app.use('/question',question);

const admin = require('./controllers/admin.js');
app.use('/admin',admin);


// MongoDb Connection

const {mongoUrl} = require('./config.js');

console.log(mongoUrl);

mongoose.connect(mongoUrl,(err,db)=>{

	if(err){
		console.log(err);
		console.log("Error Connecting To MongoDb");
		process.exit(1);
	
	}
	console.log("Connected To MongoDb.");

});


// Lift Port Definition

server.listen(process.env.PORT || 3000);