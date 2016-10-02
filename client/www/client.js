$("#tags input").tagsInput({
	"defaultText": "Add an interest...",
	"onChange": function() {
		$.post(root+"/user/preferences", {
			token: token,
			tags: $("#tags input").val()
		}).done(function(res) {
			if (res.status == "success") {
				// saved!
			} else {
				alert("An error occurred: "+res.data.message);
			}
		});
	},
	"minChars" : 0,
	"maxChars" : 0
});

$(document).ajaxError(function(event, jqxhr, settings) {
	alert("The server seems to be unreachable. Are you connected to the internet?");
});

var token = localStorage.getItem("token") || false,
	userFlow = localStorage.getItem("userFlow") || 1,
	backable = false,
	root = "/";

$("#back").click(function() {
	if (backable) {
		backable();
		backAction(false);
	}
});

function backAction(f) {
	backable = f;
	$("#back").toggle(backable !== false);
}

backAction(false);

$(".view").not("#loader").hide();

function replaceView(hide, show) {
	$(".view").not(hide+","+show).hide();
	$(show).show().removeClass("hidden");
	$(hide).addClass("hidden");
	setTimeout(function() {
		$(hide).addClass("gone").hide();
	}, 350);
}

function viewUpdate() {
	if (userFlow == 0) { // welcome
		$(codes.countries).each(function() {
			$("#prefix").append($("<option>").attr("value", this.code).text(this.name+" ("+this.code+")"));
		});
		$("#prefix option[value='+1']").attr("selected", "true");
		replaceView("#loader", "#intro");
		$(".telephone").submit(function() {
			if (!$(".telephone input").val()) {
				alert("Please enter a telephone number.");
				return false;
			}
			$.post(root+"/register", {
				cc: $("#prefix").val(),
				phone: $(".telephone input").val()
			}).done(function(res) {
				if (res.status == "success") {
					$(".slidey").addClass("second");
					backAction(function() {
						$(".slidey").removeClass("second");
					});
					$(".verify").submit(function() {
						if (!$(".verify input").val()) {
							alert("Please enter your verification code.");
							return false;
						}
						$.post(root+"/register/verify", {
							cc: $("#prefix").val(),
							phone: $(".telephone input").val(),
							SMScode: $(".verify input").val()
						}).done(function(res) {
							if (res.status == "success") {
								userFlow = 1;
								localStorage.setItem("userFlow", 1);
								token = res.data.token;
								localStorage.setItem("token", token);
								backAction(false);
								viewUpdate();
							} else {
								alert("An error occurred: "+res.data.message);
							}
						});
						return false;
					});
				} else {
					alert("An error occurred: "+res.data.message);
				}
			});
			return false;
		});
	} else if (userFlow == 1) { //
		$.get(root+"/user", {
			token: token
		}).done(function(res) {
			if (res.status == "success") {
				alert(JSON.stringify(res.data));
				actualStuff();
			} else {
				$("#error").text("An error occurred: "+res.data.message);
				replaceView("#loader", "#error");
			}
		}).fail(function(jqXHR, textStatus) {
			$("#error div").text("The server seems to be offline.");
			replaceView("#loader", "#error");
		});
		function actualStuff() {
			updateLoc();
			replaceView("#intro", "#main");
			FCMPlugin.getToken(
				function(noteid) {
					$.post(root+"/user/updatetoken", {
						token: token,
						noteid: notiftoken
					}).done(function(res) {
						if (res.status == "success") {
							// success!
						} else {
							alert("An error occurred: "+res.data.message);
						}
					});
				},
				function(err) {
					alert("An error occurred: "+err);
				}
			);
			FCMPlugin.onNotification(
				function(data) {
					if (data.wasTapped) {
						//Notification was received on device tray and tapped by the user.
						alert( JSON.stringify(data) );
					} else {
						//Notification was received in foreground. Maybe the user needs to be notified.
						alert( JSON.stringify(data) );
					}
				},
				function(msg) {
					console.log('onNotification callback successfully registered: ' + msg);
				},
				function(err) {
					console.log('Error registering onNotification callback: ' + err);
				}
			);
			$("#main button").click(function() {
				if (true) {
					$("#map").addClass("collapsed");
					$("#recent").addClass("pushedout");
					setTimeout(function() {
						$("#recent").hide();
					}, 300);
					$(".tagsinput").addClass("selectable");
					backAction(function() {
						$("#map").removeClass("collapsed");
						$("#recent").show().removeClass("pushedout");
						$(".tagsinput").removeClass("selectable");
						$(".tagsinput span").unbind("click");
					});
					$(".tagsinput span").click(function() {
						$(this).toggleClass("active");
					});
					var ping = {};
					navigator.geolocation.getCurrentPosition(function(position) {
						ping.long = position.coords.longitude;
						ping.lat = position.coords.latitude;
					}, function(error) {
						alert(error.message);
					}, {
						maximumAge: 3000,
						timeout: 5000,
						enableHighAccuracy: true
					});
				} else {
					replaceView("#main", "#loader");
					$.post(root+"/ping", {
						token: token,
						tags: $("#tags input").val(),
						longitude: ping.long,
						latitude: ping.lat
					}).done(function(res) {
						if (res.status == "success") {
							replaceView("#loader", "#main");
							$("#back").click();
							backAction(false);
						} else {
							alert("An error occurred: "+res.data.message);
						}
					});
				}
			});
			$("#recent a").click(function() {
				$.get(root+"/ping/"+$(this).attr("data-id"), {
					token: token
				}).done(function(res) {
					if (res.status == "success") {
						alert(JSON.stringify(res.data));
					} else {
						alert("An error occurred: "+res.data.message);
					}
				});
				return false;
			});
		}
		/*var push = PushNotification.init({
			"android": {
				"senderID": "XXXXXXXX"
			},
			"ios": {
				"sound": true,
				"vibration": true,
				"badge": true
			},
			"windows": {}
		});

		push.on('registration', function(data) {
			console.log('registration event: ' + data.registrationId);

			var oldRegId = localStorage.getItem('registrationId');
			if (oldRegId !== data.registrationId) {
				// Save new registration ID
				localStorage.setItem('registrationId', data.registrationId);
				// Post registrationId to your app server as the value has changed
			}

			var parentElement = document.getElementById('registration');
			var listeningElement = parentElement.querySelector('.waiting');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');
		}).on('error', function(e) {
			console.log("push error = " + e.message);
		}).on('notification', function(data) {
			console.log('notification event');
			navigator.notification.alert(
				data.message,		 // message
				null,				 // callback
				data.title,		   // title
				'Ok'				  // buttonName
			);
		});*/
	}
}

function replaceMap(c) {
	$("#map .image").css("background-image", "url(https://maps.googleapis.com/maps/api/staticmap?size=640x400&zoom=14&center="+c+"&scale=2&style=feature:water|element:geometry|color:0x165c64|saturation:34|lightness:-69|visibility:on&style=feature:landscape|element:geometry|color:0xb7caaa|saturation:-14|lightness:-18|visibility:on&style=feature:landscape.man_made|element:all|color:0xcbdac1|saturation:-6|lightness:-9|visibility:on&style=feature:road|element:geometry|color:0x8d9b83|saturation:-89|lightness:-12|visibility:on&style=feature:road.highway|element:geometry|color:0xd4dad0|saturation:-88|lightness:54|visibility:simplified&style=feature:road.arterial|element:geometry|color:0xbdc5b6|saturation:-89|lightness:-3|visibility:simplified&style=feature:road.local|element:geometry|color:0xbdc5b6|saturation:-89|lightness:-26|visibility:on&style=feature:poi|element:geometry|color:0xc17118|saturation:61|lightness:-45|visibility:on&style=feature:poi.park|element:all|color:0x8ba975|saturation:-46|lightness:-28|visibility:on&style=feature:transit|element:geometry|color:0xa43218|saturation:74|lightness:-51|visibility:simplified&style=feature:administrative.province|element:all|color:0xffffff|saturation:0|lightness:100|visibility:simplified&style=feature:administrative.neighborhood|element:all|color:0xffffff|saturation:0|lightness:100|visibility:off&style=feature:administrative.locality|element:labels|color:0xffffff|saturation:0|lightness:100|visibility:off&style=feature:administrative.land_parcel|element:all|color:0xffffff|saturation:0|lightness:100|visibility:off&style=feature:administrative|element:all|color:0x3a3935|saturation:5|lightness:-57|visibility:off&style=feature:administrative|element:all|color:0x3a3935|saturation:5|lightness:-57|visibility:off&style=feature:poi.medical|element:geometry|color:0xcba923|saturation:50|lightness:-46|visibility:on)");
}

function updateLoc() {
	navigator.geolocation.getCurrentPosition(function(position) {
		$.post(root+"/user/location", {
			token: token,
			longitude: position.coords.longitude,
			latitude: position.coords.latitude
		}).done(function(res) {
			if (res.status == "success") {
				replaceMap(position.coords.longitude+","+position.coords.latitude);
				$("#recent .list").html("");
				for (var i = 0; i < res.data.length; i++) {
					var ping = res.data[i],
						link = $("<a href='#'>").attr("data-id", ping.id),
						taglist = $("<div>").addClass("tags");
					for (var j = 0; j < ping.tags; j++) {
						taglist.append($("<span>").text(ping.tags[i]));
					}
					link.append(taglist);
					$("#recent .list").append(link);
				}
				$("#recent .list").html("");
			} else {
				alert("An error occurred: "+res.data.message);
			}
		});
	}, function(error) {
		alert(error.message);
	}, {
		maximumAge: 3000,
		timeout: 5000,
		enableHighAccuracy: true
	});
}

replaceMap("40.714728,-73.998672");

viewUpdate();