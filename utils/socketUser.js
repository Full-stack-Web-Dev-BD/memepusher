const PusherServer = require("../config/pusher");
const Room = require("../models/Room");

//Array of users
const users = [];

const addUser = ({ id, name, room,  topic, owner, pp }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    topic = topic.trim().toLowerCase();
 
    console.log(name, room)
    if (!name || !room)  { 
        console.log('Username and room are required')
        return {error: 'Username and room are required.'} 
    }; 
    const user = { id, userName: name, room, pp: pp, };
    Room.findOne({ roomName: user.room })
        .then(room => {
            if (room) {
                console.log("if room ")
                var updateRoomPerticipant = [...room.perticipant]
                if (updateRoomPerticipant.findIndex((obj) => obj.userName == user.userName) !== -1) {
                    console.log("User Existing ")
                } else {
                    updateRoomPerticipant.push(user)
                }
                room.perticipant = [...updateRoomPerticipant]
                room.save()
                    .then(newList => {
                        // socket.broadcast.to(user.room).emit('roomUpdate', { room: newList });
                        // socket.emit('roomUpdate', { room: newList });
                        console.log("Room update sent")
                        PusherServer.trigger("ROOM", "roomUpdate", {
                            roomName:room,
                            room:newList
                        });
                    })
            } else {
                console.log("createing new room ")
                new Room({ roomName: user.room, perticipant: [user], topic: topic, session: [], owner: owner })
                    .save()
                    .then(newRoom => {
                        // socket.broadcast.to(user.room).emit('roomUpdate', { room: newRoom });
                        // socket.emit('roomUpdate', { room: newRoom });
                        PusherServer.trigger("ROOM", "roomUpdate", {
                            roomName:room,
                            room:newRoom
                        });
                    })
            }
        })
        .catch(err => {
            console.log(err)
        })
    users.push(user);
    return { user };
};

const removeUser = id => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users.filter(user => user.room === room);
const socketUsers = () => {
    return users
}
module.exports = { addUser, removeUser, getUser, getUsersInRoom, socketUsers };