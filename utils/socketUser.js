const PusherServer = require("../config/pusher");
const Room = require("../models/Room");

//Array of users
const users = [];

const addUser = ({ id, name, room, roomID, topic, owner, pp }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    topic = topic.trim().toLowerCase();
 
    if (!name || !room)  { 
        console.log('Username and room are required')
        return {error: 'Username and room are required.'} 
    }; 
    const user = { id, userName: name, room, pp: pp, };
    console.log('findind foom with >>>>>>>', roomID)
    Room.findById(roomID)
        .then(room => {
            console.log('room finded  ', room )
                var updateRoomPerticipant = [...room.perticipant]
                console.log('if exist', updateRoomPerticipant , user)
                if (updateRoomPerticipant.findIndex((obj) => obj.id == user.id) !== -1) {
                    console.log("User Existing ")
                } else {
                    updateRoomPerticipant.push(user)
                }
                room.perticipant = [...updateRoomPerticipant]
                room.save()
                    .then(newList => { 
                        console.log("Room update sent")
                        PusherServer.trigger("ROOM", "roomUpdate", {
                            roomName:room,
                            room:newList
                        });
                    })
        })
        .catch(err => {
            console.log('err is ', err)
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