var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer();
var io = require('socket.io')(server);
var animal = require('animal-id');
var mongoose = require('mongoose');
var twilioNotifications = require('./middleware/twilioNotifications');
var cfg = require('./config');
var twilioClient = require('./twilioClient');
require('mongoose-double')(mongoose);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PingPong');
var db = mongoose.connection;
var User = require('./models/user.js');
var Ping = require('./models/ping.js');
var Pong = require('./models/pong.js');
var UserInterest = require('./models/userinterest.js');

animal.useSeparator(" ");

var verifyToken = function(req, res, next) {
	if(req.originalUrl=="/register"||req.originalUrl=="/register/verify") {
		next();
	}
	User.findById(req.body.token, function(error, user) {
		var obj = {
			status: "failure",
			data: {
				message: "Unable to search database"
			}
		};
		if(error) {
			res.json(obj);
		}
		else if(user==null) {
			obj.data.message = "Invalid token"
			res.json(obj);
		}
		else {
			req.user = user.toObject();
			next();
		}
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
	twilioClient.sendSms("+8172350630","testing testing 123");
});

app.post('/register', function(req, res) {
	res.send('register');
});

app.post('/register/verify', function(req, res) {
	User.searchOne({phone: req.body.phone, countryCode: req.body.countryCode}, function(error, user) {
		var obj = {
			status: "failure",
			data: {
				message: "Unable to search database"
			}
		};
		if(error) {
			res.json(obj);
		}
		else if(user==null) {
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
	var ping = new Ping({
		tags: req.body.tags,
		locations: {
			latitute: req.body.latitude,
			longitude: req.body.longitude
		},
		aliases: [{
			token: req.user._id.toString(),
			alias: animal.getId()
		}],
		pinger: req.user._id.toString()
	});

	ping.save(function(err) {
		if(err) req.json({status: "failure", data:{"message": "Unable to create ping"}});
		else req.json({status: "success", data:{"message": "Created ping"}});
	});
});

app.get('/ping/:id', function(req, res)	{							//NOT DONE
	Ping.findById(req.params.id, function(error, ping) {
		if(error) {
			req.json({status: "failure", data:{"message": "Unable to search for ping"}});
		}
		else if(ping==null) {
			req.json({status: "failure", data:{"message": "Ping not found"}});
		}
		else {
			var pingJs = ping.toObject();
			req.json({status: "success", data: { pingJs } });
		}
	});
});

app.post('/ping/:id/pong', function(req, res)	{
	res.send('ping id =' + req.params.id + ' pong');
});

app.post('/ping/:id/chat', function(req, res)	{
	res.send('ping id =' + req.params.id + ' pong');
});

app.get('/user', function(req, res) {
	res.json({status: "success", data: req.user});
});

app.post('/user/preferences', function(req, res)	{
	User.findByIdAndUpdate(req.user._id.toString(), {$set: {tags: req.body.tags}}, function(error, doc) {
		if(error) {
			res.send({status: "failure", data: {message: "Unable to update User"}});
		}
		else{
			UserInterest.remove({token: user._id.toString()}, function(error, docs) {
				if(error) {
					res.send({status: "failure", data: {message: "Unable to update UserInterest"}});
				}
				else {
					var objects = [];
					var tags = req.body.tags.slice(0);
					while(tags != []) {
						objects.unshift({token: req.user._id.toString(), tag: tags.pop()});
					}
					UserInterest.create(objects, function(error) {
						if(error) {
							res.json({status: "failure", data: { message: "Unable to create replacement tags in UserInterest" } }); 
						}
						else {
							res.json({status: "success", data: { message: "Successfully changed preferences" } });
						}
					});
				}
			});
		}
	});
});

app.post('/user/location', function(req, res)	{
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
			message: err
		}
	};
	res.json(obj);
});

app.listen(80, function() {
	console.log('Express has started on http://localhost; press Ctrl-C to terminate.');
});

module.exports = app;
