const express = require('express');
const http = require('http');
const path = require('path');
const Filter = require('bad-words');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {addUser, removeUser, getUser, getUserInRoom} =  require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server); // socket.io needs server to be passed in

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New web socket connection');


    socket.on('join', ({username, room}, callback) => {

        const {error, user} = addUser({id : socket.id, username, room})

        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'welcome !'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin' ,`${user.username} has joined!`))
        io.to(user.room).emit('roomdata', {
            room : user.room,
            users : getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (mssg, callback) => {

        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(mssg)) {
            return callback('profanity is not allowed');
        }

        io.to(user.room).emit('message', generateMessage(user.username, mssg));
        callback(); // Acknowledgement 
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback();
    })

    socket.on('disconnect', () => { // when user left, broadcast its departure
        const user = removeUser(socket.id)
        
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomdata', {
                room : user.room,
                users : getUserInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`app is listening at ${port}`);
})


// socket.emit : sends message to connected user
// io.emit : send message to all connected user
// socket.broadcast.emit : sends message to every connected user except this current socket
// io.to.emit => send message to everyone in room 
// socket.broadcast.to.emit : sends message to everyone except this current socket but in room only