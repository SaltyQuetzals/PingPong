var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer();
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var twilioNotifications = require('./middleware/twilioNotifications');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PingPong');
var db = mongoose.connection;
var User = require('./models/user.js');
var Ping = require('./models/ping.js');
var Pong = require('./models/pong.js');
var UserInterest = require('./models/userinterest.js');

var verifyToken = function(req, res, next) {
	if(req.originalUrl=="/register"||req.originalUrl=="/register/verify") {
		next();
	}
	User.findById(req.body.token, function(user, error) {
		var obj = {
			status: "failure",
			data: {
				message: "Unable to search database"
			}
		};
		if(error) {
			res.json(obj);
		}
		if(user==null) {
			obj.data.message = "Invalid token"
		}
		req.user = user.toObject();
		next();
	});
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(verifyToken);

app.get('/', function(req, res) {
	res.json({
		status: "success",
		data: {
			message: "Hello!"
		}
	});
});

app.post('/register', function(req, res) {
	res.send('register');
});

app.post('/register/verify', function(req, res) {
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
		if(user==null) {
			obj.data.message = "User does not exist";
		}
		else if(user.SMScode==req.body.SMScode) {
			obj.status = "success";
			obj.data.message = "Successfully verified";
			obj.data.token = user._id.toString();
		}
		else {
			obj.data.message = "Incorrect authorization ID"
		}
		res.json(obj);
	});
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

app.get('/:user', function(req, res) {
	res.send('user = ' + req.params.user);
});

app.post('/:user/preferences', function(req, res)	{
	res.send('user = ' + req.params.user + ' preferences');
});

app.post('/:user/location', function(req, res)	{
	res.send('user = ' + req.params.user + ' location');
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

app.use(twilioNotifications.notifyOnError);
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
