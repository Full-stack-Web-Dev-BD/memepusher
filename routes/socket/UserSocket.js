const express = require('express');
const PusherServer = require('../../config/pusher');
const UserSocket = express.Router();
const User = require('../../models/User');
const { addUser, socketUsers, getUser } = require('../../utils/socketUser');


UserSocket.post('/join', (req, res) => {
    const { name, room, topic, owner, pp } = req.body;
    console.log(req.body)
    const { error, user } = addUser({ id: owner, name, room, topic, owner, pp });
    if (error) return res.json(error);
    PusherServer.trigger("ROOM", "message", {
        roomName: room,
        sms: { user: 'admin', text: `${user.userName}, Welcome Back to room ${user.room}.`, uid: owner }, users: socketUsers()
    });
    // socket.join(user.room);
    // socket.emit('message', { sms: { user: 'admin', text: `${user.userName}, Welcome Back to room ${user.room}.`, uid: socket.id }, users: socketUsers() });
    // socket.broadcast.to(user.room).emit('message', { sms: { user: 'admin', text: `${user.userName} has joined!` }, users: socketUsers() });
    // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    res.json("joining")
})
UserSocket.post('/sendMessage', async (req, res) => {
    const { message, uid } = req.body;
    const user = getUser(uid);
    const userDetails = await User.findOne({ _id: uid })
    console.log("user is ", user)
    var sms = { user: user?.userName, text: message, uid }
    await new Chat({ room: user?.room, sms, user: userDetails })
        .save()
    PusherServer.trigger("ROOM", "message", {
        roomName: user?.room,
        sms,
        user: userDetails ? userDetails : {}
    });
    // io.to(user.room).emit('message', { sms, user: userDetails ? userDetails : {} });
    console.log("message sent", req.body)
    res.json({message:"Message Sent"})
})
// 	socket.on('sendMessage', async (data) => {
// 		const user = getUser(socket.id);
// 		const userDetails = await User.findOne({ _id: data.uid })
// 		var sms = { user: user.userName, text: data.message, uid: socket.id }
// 		await new Chat({ room: user.room, sms, user: userDetails })
// 			.save()
// 		io.to(user.room).emit('message', { sms, user: userDetails ? userDetails : {} });
// 	});




module.exports = UserSocket;