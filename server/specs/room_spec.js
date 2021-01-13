const assert = require('assert');
const Room = require('../models/socket.io/room.js');

describe('Room', function () {
    beforeEach(function () {
        room1 = new Room([], "Lobby");
    });

    it('should contain a grid', function() {
        assert.deepStrictEqual(room1.grid, []);
    });
    it('should have a name');
    it('should start with an empty array of users');
});