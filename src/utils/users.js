const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if(!username || !room) {
        return {
            error: 'username and room required!'
        }
    }
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    if(existingUser) {
        return {
            error: 'username already in use'
        }
    }
    const user = {id, username, room}
    users.push(user)
    return { undefined, user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index !== -1) {
        return users[index]
    }
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const arr = users.filter((user) => {
        return user.room === room
    })
    return arr
}

const allrooms = () => {
    let rooms = [] 
    users.forEach((user) => {
        if(!rooms.includes(user.room)) {
            rooms.push(user.room)
        }
    });
    return rooms
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    allrooms
}