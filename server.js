// include file on how database is structured
const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')

app.use(bodyParser());
app.use(express.static('public'));

const bcrypt = require('bcrypt');
const saltRounds = 10;

var dbUrl = "mongodb://juan:tinybeans1@ds261648.mlab.com:61648/tinybeans";

MongoClient.connect(dbUrl, function(err, client) {
	if(err) { console.log(err); }
	var db = client.db('tinybeans');

	app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') });

	app.post('submitPollAnswerById', function(req, res){
		res.send("success");
	});

	app.post('/pollById', function(req, res) {
		console.log('Processing /pollById');
		db.collection("polls").find({
			ID: parseInt(req.body.ID)
		}).toArray(function(err, result) {
			res.send(result);
		})
		console.log('Completed /pollsById request');
	});

	app.post('/pollsByUser', function(req, res){
		console.log('Proccessing /pollsByUser request')
		var availablePolls = [];
		var completedPolls = [];
		var username = req.body.username;
		db.collection("polls").find({}).toArray(function(err, result) {
			for(var i = 0; i < result.length;i++) {
				var poll = result[i];
				var pollHasBeenCompleted = false;
				for (j = 0; j < poll.completedBy.length;j++) {
					if(username === poll.completedBy[j]) {
						pollHasBeenCompleted = true;
					}
				}
				if(pollHasBeenCompleted) {
					completedPolls.push(poll);
				} else {
					availablePolls.push(poll);					
				}
			}
			res.send({
				"availablePolls": availablePolls,
				"completedPolls": completedPolls
			});
			console.log('Completed /pollsByUser request')
		});
	});

	app.post('createPoll', function(req,res) {
		var pollName = "";
		var answerA  = "";
		var answerB  = "";
		var answerC  = "";
		var answerD  = "";
		var answerE  = "";

		db.collection("polls").insertOne({
			"pollName":"",
			"answerA":"",
			"answerB":"",
			"answerC":"",
			"answerD":"",
			"completedBy": [],
			"answerACount":0,
			"answerBCount":0,
			"answerCCount":0,
			"answerDCount":0
		}, function(err, res) {
			if(err) { 
				console.log(err);
				res.send('error');
			} else {
				res.send('success');
			}
		});
	})

	app.post('/signup', function(req,res) {
		var username = req.body.username
		var plaintextPassword = req.body.password
		bcrypt.genSalt(saltRounds, function(err, salt) {
		    bcrypt.hash(plaintextPassword, salt, function(err, hash) {
				db.collection("users").insertOne({
					username:username,
					password:hash
				}, function(err) {
					if(err) { 
						res.send('failed');
					} else { 
						res.send('success'); 
					}
				});
		    });
		});
	});

	app.post('/login', function(req,res) {
		console.log('Proccessing /login request')
		db.collection("users").find({
			'username': req.body.username
		}).toArray(function(err, result) {
			console.log(result)
			if(result.length > 0) {
				bcrypt.compare(req.body.password, result[0].password, function(err, crytRes) {
				  if (err) {
				  	console.log('bcrypt compare error');
					res.send('empty');				        	
				  }
				  if (crytRes) {
					res.send(result[0]);
				  } else {
					res.send('empty');
				  }
				});
			} else {
				console.log('false')
			}
			console.log('Completed /login request')
		});
	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
