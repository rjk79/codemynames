import Board from './Board/Board'
import React from "react";
// import io from "socket.io-client";
import './App.css'
import { translateColor, formatSeconds } from './utils'
import {Link} from 'react-router-dom'

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.socket = this.props.socket
        this.state = {
            messages: [],
            message: "",
            game: null,
            timeShowing: true,
        }
        this.handleSetMessage = this.handleSetMessage.bind(this)
        this.sendMessage = this.sendMessage.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.makeMove = this.makeMove.bind(this);
        this.changeTurn = this.changeTurn.bind(this);
        this.changeTeam = this.changeTeam.bind(this);
        this.changeSpymasterStatus = this.changeSpymasterStatus.bind(this);
        this.changeUndercoverStatus = this.changeUndercoverStatus.bind(this);
        this.teamPlayerLis = this.teamPlayerLis.bind(this);
        this.numberRevealedIn = this.numberRevealedIn.bind(this);
        this.setTimeShowing = this.setTimeShowing.bind(this);
    }

    componentDidMount() {
        this.socket.on("receive message", data => {
            this.setState({ messages: this.state.messages.concat([data]) }, () => {
                let messages = document.getElementsByClassName("messages")[0]
                messages.scrollTop = messages.scrollHeight;
            })
        });
        this.socket.on("receive game", data => {
            this.setState({ game: data }, () => console.log(this.state))
        });
    }

    numberRevealedIn(color) {
        const {cards} = this.state.game
        return cards.filter(c=>(c.color === color) && c.isRevealed).length
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
        this.socket.emit('opt to change turn', { gameId: id })
    }

    changeTeam() {
        const { id } = this.state.game
        this.socket.emit('change team', { gameId: id })
    }

    changeSpymasterStatus() {
        const { id } = this.state.game
        this.socket.emit('change spymaster status', { gameId: id })
    }

    changeUndercoverStatus() {
        const { id } = this.state.game
        this.socket.emit('change undercover status', { gameId: id })
    }

    setTimeShowing() {
        this.setState({timeShowing: !this.state.timeShowing})
    }

    teamPlayerLis (num) {
        const {game} = this.state
        return Object.values(game.players).filter(p => p.color === (game['color' + num.toString()]) && !p.isUndercover).map((p, i) => {
            const spymasterLabel = p.isSpymaster ? <i className="fas fa-user-secret"></i> : null
            return (
                <li key={i} style={{ color: translateColor(p.color) }}>{p.username} {spymasterLabel}</li>
            )
        })
    }

    render() {
        const { sendMessage, handleSetMessage, resetGame, makeMove, numberRevealedIn } = this
        const { message, messages, game, timeShowing } = this.state
        const { currentUser } = this.props

        let messageLis 
        let currentUserObject
        let yourColor
        let gameName
        let changeTurnButton
        let team1PlayerLis
        let team2PlayerLis
        let undercoverLis
        let score
        let turnTime
        let spyMasterButton 
        let undercoverButton
        let changeTeamButton
        if (game) {
            messageLis = []
            messages.forEach((m, i) => {
                const sender = Object.values(game.players).filter(p => p.username === m.name)[0]
                if (!sender) debugger
                const playerColor = sender.color
                messageLis.push(<div key={i} ><strong style={!sender.isUndercover ? {color: translateColor(playerColor)} : {}}>{m.name}</strong>{": " + m.message}</div>)
            })
            
            currentUserObject = Object.values(game.players).filter(p => p.username === currentUser)[0]
            yourColor = game ? currentUserObject.color : null
            gameName = game ? game.id : null
            if (!currentUserObject.isUndercover && game.currentTurnColor === yourColor) changeTurnButton = <button className="btn btn-primary" onClick={this.changeTurn}>End Your Team's Turn</button> 
            team1PlayerLis = this.teamPlayerLis(1)
            team2PlayerLis = this.teamPlayerLis(2)
            score = <div>
                <div style={{color: translateColor(game.color1)}}>{9 - numberRevealedIn(game.color1)}</div> 
                -
                <div style={{color: translateColor(game.color2)}}>{8 - numberRevealedIn(game.color2)}</div>
            </div>
            if (timeShowing) turnTime = formatSeconds(game.turnTime);

            if (!currentUserObject.isUndercover ) spyMasterButton = <button className="btn btn-primary" onClick={this.changeSpymasterStatus}>{!currentUserObject.isSpymaster ? "Become Spymaster" : "Stop Being Spymaster"} </button> 
            if (!currentUserObject.isUndercover) changeTeamButton = <button className="btn btn-primary" onClick={this.changeTeam}>Change Team</button>
            undercoverButton = !currentUserObject.isSpymaster ? <button className="btn btn-primary" onClick={this.changeUndercoverStatus}>{!currentUserObject.isUndercover ? "Go Undercover" : "Reveal Your Cover"} </button> : null
            undercoverLis = Object.values(game.players).filter(p => p.isUndercover).map((p, i) => (<li key={i}>{p.username} {currentUserObject.username === p.username ? "(" + p.color.toUpperCase() + " Team - don't tell!!)" : null} </li>))

            debugger
        }
        return (
            <div className="App">                
                <div className="main">
                    <div className="game">
                        <div className="game-codes">
                            <div>Room Code: {gameName}</div>
                            <div>Your Username: {currentUser}</div>
                        </div>
                        {/* <div className="color-reminder on-white" style={game ? {color: translateColor(yourColor)} : {}}>You are on {yourColor && yourColor.toUpperCase()} Team</div> */}
                        <div className="color-reminder on-white">{score}</div>
                        <div className="color-reminder" style={game ? { background: translateColor(game.currentTurnColor) } : {}}>
                            <div className="turn-time">{turnTime}</div>
                            <div>{game && game.currentTurnColor.toUpperCase()}'s Turn </div>
                            {changeTurnButton}
                        </div>

                        <Board game={game} 
                            makeMove={makeMove}
                            currentUser={currentUser}
                        />
                        <div className="team-lists">
                            <div className="team-list">
                                <div style={{ color: game ? translateColor(game.color1) : ""}}>Team {game && game.color1.toUpperCase()}:</div>
                                {team1PlayerLis}
                            </div>
                            <div className="team-list">
                                <div style={{ color: game ? translateColor(game.color2) : "" }}>Team {game && game.color2.toUpperCase()}:</div>
                                {team2PlayerLis}
                            </div>
                            <div className="team-list">
                                <div style={{ color: "gray" }}>Undercover Agents:</div>
                                {undercoverLis}
                            </div>
                        </div>
                        <div className="game-controls">
                            {/* <Link className="btn btn-primary" to="/">Return to Home Page</Link> */}
                            {changeTeamButton}
                            {spyMasterButton}
                            <button className="btn btn-primary" onClick={this.setTimeShowing}>Show/Hide Timer</button>
                            {undercoverButton}
                        </div>
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
                        <button className="btn btn-primary" onClick={resetGame}>New Game</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;