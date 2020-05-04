import Board from './Board/Board'
import React from "react";
// import io from "socket.io-client";
import './App.css'

// const socket = io('http://localhost:5000')

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.socket = this.props.socket
        this.state = {
            messages: [],
            message: "",
            game: null,
        }
        this.handleSetMessage = this.handleSetMessage.bind(this)
        this.sendMessage = this.sendMessage.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.makeMove = this.makeMove.bind(this);
        this.changeTurn = this.changeTurn.bind(this);
        this.changeTeam = this.changeTeam.bind(this);
        this.changeSpymasterStatus = this.changeSpymasterStatus.bind(this);
    }

    componentDidMount() {
        this.socket.on("receive message", data => {
            this.setState({ messages: this.state.messages.concat([data]) }, () => {
                let messages = document.getElementsByClassName("messages")[0]
                messages.scrollTop = messages.scrollHeight;
            })
        });
        this.socket.on("receive game", data => {
            debugger
            this.setState({ game: data }, () => console.log(this.state))
        });
    }

    componentWillUnmount() {
        this.socket.off('receive message')
        this.socket.off('receive game')
    }

    sendMessage(e) {
        const {id} = this.state.game
        const {message} = this.state
        e.preventDefault()
        this.socket.emit('send message', {message, id})
        this.setState({ message: "" })
    }

    handleSetMessage(e) {
        this.setState({ message: e.target.value })
    }

    resetGame() {
        const {id} = this.state.game
        this.socket.emit('reset game', id)
    }

    makeMove(idx) {
        const {id} = this.state.game
        return () => {
            this.socket.emit('make move', {idx, id})
        }
    }

    changeTurn() {
        const { id } = this.state.game
        this.socket.emit('change turn', { gameId: id })
    }

    changeTeam() {
        const { id } = this.state.game
        this.socket.emit('change team', { gameId: id })
    }

    changeSpymasterStatus() {
        const { id } = this.state.game
        this.socket.emit('change spymaster status', { gameId: id })
    }

    render() {
        const { sendMessage, handleSetMessage, resetGame, makeMove } = this
        const { message, messages, game } = this.state
        const { currentUser } = this.props

        const messageLis = messages.map((m, i) => <div key={i}>{m.name + ":" + m.message}</div>)
        const yourColor = game ? Object.values(game.players).filter(p => p.username === currentUser)[0].color : null
        const gameName = game ? game.id : null
        return (
            <div>                
                <div className="main">
                    <div className="cards-headers">
                        <div>Game name: {gameName}</div>
                        <div>Your name: {currentUser}</div>
                        <div>Your color: {yourColor}</div>
                        <div>Current Team's Color: {game && game.currentTurnColor}</div>
                        <Board game={game} 
                            makeMove={makeMove}
                            currentUser={currentUser}
                        />
                        <button onClick={this.changeTurn}>End Turn</button>
                        <button onClick={this.changeTeam}>Change Team</button>
                        <button onClick={this.changeSpymasterStatus}>Toggle Spymaster Status</button>
                    </div>
                    <div className="messaging-controls">
                        <div className="messages">
                            <div className="title">Chat</div>
                            {messageLis}
                        </div>
                        <form onSubmit={sendMessage}>
                            <input type="text" onChange={handleSetMessage} value={message} placeholder="Message"/>
                            <input type="submit" value="Send Message" className="btn btn-primary send" />
                        </form>
                        <button className="btn btn-warning" onClick={resetGame}>New Game</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;