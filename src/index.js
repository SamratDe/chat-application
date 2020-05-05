const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const ejs = require('ejs')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, allrooms } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const ob = {
        name: 'Samrat',
        arr: allrooms()
    }
    res.render('home', {ob: ob})
})

io.on('connection', (socket) => {
    socket.on('join', ({username, room, activeroom}, callback) => {
        if(room && activeroom && room !== activeroom) {
            return callback('Cannot enter both rooms at the same time')
        }
        let ob
        if(room) {
            ob = addUser({ id: socket.id, username, room })
            if(ob.error) {
                return callback(ob.error)
            }
        }
        else {
            room = activeroom
            ob = addUser({ id: socket.id, username, room })
            if(ob.error) {
                return callback(ob.error)
            }
        }
        socket.join(ob.user.room)
        socket.emit('showMessage', generateMessage('admin', 'Welcome'))
        socket.broadcast.to(ob.user.room).emit('showMessage', generateMessage('admin', `${ob.user.username} has joined the chat`))
        io.to(ob.user.room).emit('roomData', {
            room: ob.user.room,
            users: getUsersInRoom(ob.user.room)
        })
        callback()
    })
    socket.on('sendMessagetoAll', (msg, callback) => {
        const filter = new Filter()
        if(filter.isProfane(msg)) {
            return callback('use of bad words not allowed!!')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('showMessage', generateMessage(user.username, msg))
        callback()
    })
    socket.on('sendingLocation', (ob, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('showLocationMessage', generateMessage(user.username, `https://google.com/maps?q=${ob.lat},${ob.long}&SameSite=None`))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('showMessage', generateMessage('admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }        
    })
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})