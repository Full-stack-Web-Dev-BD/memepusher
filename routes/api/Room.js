const express = require('express');
const Room = require('../../models/Room');
const RoomRouter = express.Router();

RoomRouter.post('/', (req, res) => {
    if (req.body.roomName && req.body.owner && req.body.topic) {
        new Room({ roomName: req.body.roomName, perticipant: [], topic: req.body.topic, session: [], owner: req.body.owner })
            .save()
            .then(async newRoom => {
                var allRoom = await Room.find()
                res.json({ message: "Room is created ! ", rooms: allRoom.reverse() })
            })
            .catch(err => {
                return res.json({ message: "Server error ", err })
            })
    }else{
        console.log(req.body,"not auth ")
        res.status(400).json({message:"Room name topic , owner requreid "})
    }
})
RoomRouter.get('/', async (req, res) => {
    var rooms = await Room.find()
    res.json(rooms.reverse())
})

RoomRouter.get('/:roomID', async (req, res) => {
    
    var roomID = req.params.roomID.toLowerCase()
    var room = await Room.findById(roomID)
    console.log('check room ', room)
    if (room) {
        res.json(room)
    } else {
        res.json({})
    }
})
RoomRouter.post('/find', async (req, res) => {
    if (!req.body.roomName) return res.json({ message: "roomName is requried to find a room " }).status(400)
    var roomName = req.body.roomName.toLowerCase()
    var room = await Room.findOne({ roomName: roomName })
    if (room) {
        res.json(room)
    } else {
        res.json({})
    }
})

RoomRouter.delete('/:id', async (req, res) => {
    var deleted = await Room.findByIdAndDelete(req.params.id)
    res.json(deleted)
})

module.exports = RoomRouter;