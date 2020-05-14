const Game = require("./Game")
const express = require("express");
const expressStatusMonitor = require('express-status-monitor')
const app = express();

const port = process.env.PORT || 5000;

let server = app.listen(port, () => console.log(`Server is running on port ${port}`));

const socketIO = require('socket.io');
const io = socketIO(server);

if (process.env.NODE_ENV === 'production') {
    app.use(expressStatusMonitor({
            websocket: io, 
            port: app.get('port')
        }),
        express.static('frontend/build')
    );
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    })
}


//socket.io


let lobby = {} //games

function sendGameToAllPlayers(gameId) {
    const game = lobby[gameId]
    const playerIds = Object.keys(game.players)
    for (let i = 0; i < playerIds.length; i++) {
        io.to(playerIds[i]).emit('receive game', game)
    }
}
function sendMessageToAllPlayers(gameId, message, socketId) {
    const game = lobby[gameId]
    const name = game.players[socketId].username
    const playerIds = Object.keys(game.players)
    for (let i = 0; i < playerIds.length; i++) {
        io.to(playerIds[i]).emit('receive message', {message: message, name})
    }
}

function changeTurn(gameId, socketId){
    const game = lobby[gameId]
    game.changeTurn()
    sendGameToAllPlayers(gameId)
}

function gameExists(id, socketId) {
    const game = lobby[id]
    if (game) {
        return true
    }
    else {
        console.log(id, lobby)
        io.to(socketId).emit('receive message', {message: "game timed out -- sorry!", name: "ADMIN"})
        return false
    }
}

io.on('connection', (socket) => {
    console.log('Client connected' + socket.id);

    socket.on('disconnect', () => {
        const gamesJoined = Object.values(lobby).filter(g => Object.keys(g.players).includes(socket.id))
        if (gamesJoined.length) {
            game = gamesJoined[0]
            sendMessageToAllPlayers(game.id, "left the game.", socket.id)
            delete game.players[socket.id]
            sendGameToAllPlayers(game.id)
        }
        console.log('Client disconnected')
    });

    socket.on('send message', data => { //client has sent a message. use socket instead of io. 
        const {message, id} = data
        if (!gameExists(id, socket.id)) return; 

        sendMessageToAllPlayers(id, message, socket.id)
        //send message to clients. use io instead of socket to emit to all other sockets
    })

    socket.on('join lobby', ({gameName, currentUser, colors, wordPack}) => {
        const gameId = gameName
        if (!(gameId in lobby)) lobby[gameId] = new Game(gameId, colors[0], colors[1], wordPack);
        const game = lobby[gameId]
        game.addPlayer(socket.id, currentUser)
        sendMessageToAllPlayers(gameId, "joined the game!", socket.id)
        sendGameToAllPlayers(gameId)
    })

    socket.on('reset game', gameId => {
        let game = lobby[gameId]
        if (!gameExists(gameId, socket.id)) return; 

        let currPlayers = game.players
        game = new Game(gameId, game.color1, game.color2, game.wordPack)
        game.players = currPlayers
        lobby[gameId] = game
        sendMessageToAllPlayers(gameId, "started a new game!", socket.id)
        sendGameToAllPlayers(gameId)
    })

    socket.on('make move', data => {
        const {idx, id} = data
        const game = lobby[id]
        if (!gameExists(id, socket.id)) return; 
        
        game.makeMove(idx, socket.id)
        sendMessageToAllPlayers(id, game.mostRecentMove, socket.id)
        sendGameToAllPlayers(id)
        if (game.winner) {
            sendMessageToAllPlayers(id, "ended the game. " + game.winner.toUpperCase() + " Team" + " has won!!!", socket.id)
        }
        if (game.shouldChangeTurn) changeTurn(id, socket.id)
    })

    socket.on('change team', data => {
        const { gameId } = data
        const game = lobby[gameId]
        if (!gameExists(gameId, socket.id)) return; 

        game.changeTeam(socket.id)
        sendGameToAllPlayers(gameId)
        sendMessageToAllPlayers(gameId, "--CHANGED TEAMS!--", socket.id)
    })

    socket.on('opt to change turn', data => {
        const {gameId} = data
        if (!gameExists(gameId, socket.id)) return; 
        
        changeTurn(gameId, socket.id)
        sendMessageToAllPlayers(gameId, `ended the turn early`, socket.id)
    })

    socket.on('change spymaster status', data => {
        const { gameId } = data
        const game = lobby[gameId]
        if (!gameExists(gameId, socket.id)) return; 

        game.players[socket.id].isSpymaster = !game.players[socket.id].isSpymaster
        sendGameToAllPlayers(gameId)
        sendMessageToAllPlayers(gameId, "--CHANGED SPYMASTER STATUS!--", socket.id)
    })
});