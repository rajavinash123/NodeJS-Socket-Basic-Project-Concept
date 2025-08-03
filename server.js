const express = require('express');
const http = require('http'); 
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = new Set();
const socketUserMap = new Map();

io.on("connection", (socket) => {
    console.log('A user is now connected!');

    socket.on('join', (userName) => {
        if (userName) {
            socketUserMap.set(socket.id, userName);
            users.add(userName);
            io.emit('userJoined', userName);
            io.emit('usersList', Array.from(users));
        }
    });

    socket.on('chat message', (msg) => {
        const sender = socketUserMap.get(socket.id);
        if (sender && msg) {
            io.emit('chat message', { sender, text: msg });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user has disconnected!');
        const disconnectedUser = socketUserMap.get(socket.id);
        if (disconnectedUser) {
            users.delete(disconnectedUser);
            socketUserMap.delete(socket.id);
            io.emit('userLeft', disconnectedUser);
            io.emit('usersList', Array.from(users));
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
});


//go and paste in browers http://localhost:3000/