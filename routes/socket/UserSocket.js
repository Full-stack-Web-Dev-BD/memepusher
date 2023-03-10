const express = require('express');
const PusherServer = require('../../config/pusher');
const UserSocket = express.Router();
const User = require('../../models/User');
const { addUser, socketUsers, getUser } = require('../../utils/socketUser');


UserSocket.post('/join', (req, res) => {
    const { name, room, topic, owner, pp ,roomID} = req.body;
    const { error, user } = addUser({ id: owner, name,roomID, room, topic, owner, pp });
    console.log(name," is   joining >>>>>>>>")
    if (error) return res.json(error);
    PusherServer.trigger("ROOM", "message", {
        roomName: room,
        sms: { user: 'admin', text: `${user.userName}, Welcome Back to room ${user.room}.`, uid: owner }, users: socketUsers()
    }); 
    res.json("joining")
})
UserSocket.post('/sendMessage', async (req, res) => {
    const { message, uid,roomID } = req.body;
    const user = getUser(uid);
    const userDetails = await User.findOne({ _id: uid })
    console.log("user is ", user)
    var sms = { user: user?.userName, text: message, uid }
    await new Chat({ room: user?.room, sms, user: userDetails })
        .save()
    PusherServer.trigger("ROOM", "message", {
        roomName: user?.room,
        sms,
        user: userDetails ? userDetails : {},
        roomID
    });
    console.log("message sent", req.body)
    res.json({message:"Message Sent"})
}) 

UserSocket.post('/roundPush', (req, res)=>{
    console.log('a new round created in round', req.body)
    PusherServer.trigger("ROOM", "roundPushBack", { message:"A new Round has been  created !!",  ...req.body });   
})
module.exports = UserSocket;