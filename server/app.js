var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

// view engine setup

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
	res.send('register id = ' + req.params.code);
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
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
});

app.listen(80);

module.exports = app;
