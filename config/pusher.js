
const Pusher = require("pusher");


//Pusher
var PusherServer = new Pusher({
	appId: "1535411",
	key: "6f320e55606c338bdbf7",
	secret: "043b6f419d25fffafb4a",
	cluster: "ap2",
	useTLS: true
});
module.exports= PusherServer
