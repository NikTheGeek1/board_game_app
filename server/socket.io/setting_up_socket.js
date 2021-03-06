const createRoom = require('./create_room');
const disconnect = require('./disconnect');
const looking_for_rooms = require('./looking_for_rooms');
const joinRoom = require('./join_room');
const moved = require('./moved');
const clean_up = require('./clean_up');
const i_won = require('./i_won');
const sendInitialGrid = require('./send_initial_grid');

module.exports = (io, collection) => {

    io.on('connection', (socket) => {
        
    looking_for_rooms(socket);    
    createRoom(socket);
    sendInitialGrid(socket);
    joinRoom(socket, io, collection);
    moved(socket);
    clean_up(socket, io);
    i_won(socket);
    disconnect(socket, io);

});
}

