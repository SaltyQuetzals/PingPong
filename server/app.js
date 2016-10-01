var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer();
var io = require('socket.io')(server);
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PingPong');
var db = mongoose.connection;
var User = require('./models/user.js');
var Ping = require('./models/ping.js');
var Pong = require('./models/pong.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.send('successful');
});

app.post('/register', function(req, res) {
	res.send('register');
});

app.post('/register/:id', function(req, res) {
	User.searchOne({phone: req.body.phone, countryCode: req.body.countryCode}, function(user, error) {
		var obj = {
			status: "failure",
			data: {
				message: "Unable to search database"
			}
		};
		if(error) {
			res.json(obj);
		}
		if(user.authyId==req.params.id) {
			obj.status = "success";
			obj.data.message = "Successfully verified";
		}
		else {
			obj.data.message = "Incorrect authorization ID"
		}
		res.json(obj);
	});
});

app.get('/:user', function(req, res) {
	res.send('user = ' + req.params.user);
});

app.post('/:user/preferences', function(req, res)	{
	res.send('user = ' + req.params.user + ' preferences');
});

app.post('/user/location', function(req, res)	{
	res.send('user = ' + req.params.user + ' location');
});

app.post('/ping', function(req, res)	{
	res.send('ping');
});

app.get('/ping/:id', function(req, res)	{
	res.send('ping id =' + req.params.id);
});

app.post('/ping/:id/pong', function(req, res)	{
	res.send('ping id =' + req.params.id + ' pong');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var obj = {
		status: "failure",
		data: {
			message: "Endpoint not found."
		}
	};
	res.json(obj);
});

// error handlers

// production error handler
app.use(function(err, req, res, next) {
	var obj = {
		status: "failure",
		data: {
			message: "Internal Error."
		}
	};
	res.json(obj);
});

app.listen(80, function() {
	console.log('Express has started on http://localhost; press Ctrl-C to terminate.');
});

module.exports = app;
