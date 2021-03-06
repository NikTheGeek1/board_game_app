const Room = require('../models/socket.io/room');
const User = require('../models/socket.io/user');
const rooms = require('../repositories/rooms').getRooms();
const roomNameGen = require('../helpers/generate_room_name');

module.exports = socket => {
    socket.on('create-room', ({ userObj}, cb) => {
        const roomName = roomNameGen(10);
        socket.join(roomName);
        const user = new User(userObj.userName, userObj.wins, userObj.losses, socket.id);
        const room = new Room(null, roomName);
        room.addUser(user);
        cb(room); // sends room back
        rooms.addRoom(room);
        socket.broadcast.emit('rooms-list', rooms.getAvailableRooms());
    });
};