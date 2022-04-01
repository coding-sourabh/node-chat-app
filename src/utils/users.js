const users = [];

const addUser = ({id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if(!username || !room) {
        return {
            error : 'Username and Room requierd'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    // validate username
    if(existingUser) {
        return {
            error : 'Username in use!'
        }
    }

    // Store user
    const user = {id , username, room};
    users.push(user);
    return {user};   // short hand syntax when key and value are same in object
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}


const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}