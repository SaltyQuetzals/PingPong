var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer();
var io = require('socket.io')(server);
var animal = require('animal-id');
var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var twilioNotifications = require('./middleware/twilioNotifications');
var cfg = require('./config');
var twilioClient = require('./twilioClient');
var FCM = require('fcm-push');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PingPong');
var db = mongoose.connection;
var User = require('./models/user.js');
var Ping = require('./models/ping.js');
var Pong = require('./models/pong.js');

animal.useSeparator(" ");

var serverKey = 'AIzaSyCvy2ezN-lrEH0qGmDYVeacrxnfJA-H62E';
var fcm = new FCM(serverKey);

var verifyToken = function(req, res, next) {
    if ((req.originalUrl == "/register" || req.originalUrl == "/register/verify") && (req.method == "POST")) {
        next();
    }
    User.findById(req.body.token, function(error, user) {
        var obj = {
            status: "failure",
            data: {
                message: "Unable to search database"
            }
        };
        if (error) {
            res.json(obj);
        } else if (user == null) {
            obj.data.message = "Invalid token"
            res.json(obj);
        } else if (user.verified == false) {
            obj.data.message = "Account not verified"
            res.json(obj);
        } else {
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
//app.use(verifyToken);

app.listen(80, function() {
    console.log('Express has started on http://localhost; press Ctrl-C to terminate.');
});

app.get('/', function(req, res) {
    res.json({
        status: "success",
        data: {
            message: "Hello!"
        }
    });
});

app.post('/register', function(req, res) {
    var authCode = "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10);
    console.log(authCode);
    var user = new User({
        countryCode: req.body.cc || "+1",
        phone: req.body.phone || "0123456789",
        SMScode: authCode,
        tags: [],
        verified: false,
        noteId: req.body.noteId,
        os: "_",
        loc: {
            type: "Point",
            coordinates: [req.body.longitude, req.body.latitude]
        }
    });
    user.save(function(err, user) {
        if (err) return console.error(err);
    });
    twilioClient.sendSms(req.body.phone, authCode);
});

app.post('/register/verify', function(req, res) {
    User.searchOne({
        phone: req.body.phone,
        countryCode: req.body.countryCode
    }, function(error, user) {
        var obj = {
            status: "failure",
            data: {
                message: "Unable to search database"
            }
        };
        if (error) {
            res.json(obj);
        } else if (user == null) {
            obj.data.message = "User does not exist";
        } else if (user.SMScode == req.body.SMScode) {
            obj.status = "success";
            obj.data.message = "Successfully verified";
            obj.data.token = user._id.toString();
        } else {
            obj.data.message = "Incorrect authorization ID"
        }
        res.json(obj);
    });
});

app.post('/ping', function(req, res) {
    var ping = new Ping({
        tags: req.body.tags.split(","),
        loc: {
            type: "Point",
            coordinates: [req.body.longitude, req.body.latitude]
        },
        aliases: [{
            token: req.user._id.toString(),
            alias: animal.getId()
        }],
        pinger: req.user._id.toString()
    });
    ping.save(function(err) {
        if (err) {
            res.json({
                status: "failure",
                data: err
            });
        }
    });
    User.find({
        loc: {
            $near: [req.body.longitude, req.body.latitude],
            $maxDistance: (3.0 / 6371.0)
        }
    }, function(error, users) {
        if (error) {
            res.json({
                status: "failure",
                data: error
            });
        } else {
            var tags = req.body.tags.split(",");
            var trueusers = [];
            for (var i = 0; i < users.length; i++) {
                var ithUser = users[i];
                if (ithUser.tags.filter(function(value) {
                        return tags.indexOf(value) > -1;
                    }).length != 0) {
                    var tempUser = ithUser.toObject();
                    trueusers.push(tempUser);
                }
            }
            for (var i = 0; i < trueusers.length; i++) {
                var ithUser = trueusers[i];
                var message = {
                    to: ithUser.noteId,
                    priority: "normal",
                    notification: {
                        body: "Someone who shares your interest in near you!",
                        title: "You've been Pinged",
                        icon: "new",
                    }
                };
                fcm.send(message, function(err, response) {
                    if (err) {
                        res.json({
                            status: "success",
                            data: err
                        });

                    } else {
                        res.json({
                            status: "success",
                            data: trueusers
                        });
                    }
                });

            }
        }
    });
});

app.get('/ping/:id', function(req, res) {
    Ping.findById(req.params.id, function(error, ping) {
        if (error) {
            req.json({
                status: "failure",
                data: {
                    "message": "Unable to search for ping"
                }
            });
        } else if (ping == null) {
            req.json({
                status: "failure",
                data: {
                    "message": "Ping not found"
                }
            });
        } else {
            var pingJs = ping.toObject();
            req.json({
                status: "success",
                data: pingJs
            });
        }
    });
});

app.post('/ping/:id/pong', function(req, res) {
    pong = new Pong({
        pingId: req.body.pingId
    });
    pong.save(function(err) {
        if (err) {
            res.json({
                status: "failure",
                data: err
            });
        } else {
            Ping.findByIdAndUpdate(req.body.pingId, {
                $inc: {
                    numberOfPongers: 1
                }
            }, function(error, ping) {
                if (error) {
                    res.json({
                        status: "failure",
                        data: error
                    });
                } else {
                    res.json({
                        status: "success",
                        data: {
                            message: "Successfully ponged a person"
                        }
                    });
                }
            });
        }
    });
});

app.get('/user', function(req, res) {
    res.json({
        status: "success",
        data: req.user
    });
});

app.post('/user/updatetoken', function(req, res) {
    User.findByIdAndUpdate(req.user._id.toString(), {
        $set: {
            noteId: req.user.noteId
        }
    }, function(err, doc) {
        if (err) {
            res.json({
                status: "failure",
                data: {
                    message: "Unable to update token"
                }
            });
        } else {
            res.json({
                status: "success",
                data: {
                    message: "Successfully updated token"
                }
            });
        }
    });
});

app.post('/user/preferences', function(req, res) {
    User.findByIdAndUpdate(req.user._id.toString(), {
        $set: {
            tags: req.body.tags.split(",")
        }
    }, function(error, doc) {
        if (error) {
            res.send({
                status: "failure",
                data: {
                    message: "Unable to update User"
                }
            });
        } else {
            res.json({
                status: "success",
                data: {
                    message: "Successfully changed preferences"
                }
            });
        }
    });
});

app.post('/user/location', function(req, res) {
    User.findByIdAndUpdate(req.user._id.toString(), {
            $set: {
                loc: {
                    type: "Point",
                    coordinates: [req.body.longitude, req.body.latitude]
                }
            }
        },
        function(err, doc) {
            Ping.find({
                loc: {
                    $near: [req.body.longitude, req.body.latitude],
                    $maxDistance: (3.0 / 6371.0)
                }
            }, function(error, pings) {
                if (error) {
                    res.json({
                        status: "failure",
                        data: error
                    });
                } else {
                    var truepings = [];
                    for (var i = 0; i < pings.length; i++) {
                        if (pings[i].tags.filter(function(value) {
                                return req.user.tags.indexOf(value) > -1;
                            }).length != 0) {
                            var tempPing = pings[i].toObject();
                            truepings.push(tempPing);
                        }
                    }
                    for (var i = 0; i < truepings.length; i++) {
                        var ithPing = truepings[i];
                        var message = {
                            to: req.user.noteId,
                            priority: "normal",
                            notification: {
                                body: "Someone who shares your interest in near you!",
                                title: "You've been Pinged",
                                icon: "new",
                            }
                        };
                        fcm.send(message, function(err, response) {
                            if (err) {
                                res.json({
                                    status: "success",
                                    data: err
                                });

                            } else {
                                res.json({
                                    status: "success",
                                    data: truepings
                                });
                            }
                        });

                    }
                }
            });
        });
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

module.exports = app;
