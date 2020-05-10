import React, { Component } from 'react';
import './Board.css'
import { translateColor } from '../utils'

class Board extends Component {
    
    render() {
        const {game, makeMove, currentUser } = this.props
        const cards = game && game.cards

        
        const grid = []
        if (cards) {
            const currentUserObject = Object.values(game.players).filter(p => p.username === currentUser)[0]
            const isSpymaster = currentUserObject.isSpymaster
            const hasTurn = currentUserObject.color === game.currentTurnColor
            const isOver = game.winner

            for (let i = 0; i < 5; i++) {
                let rowItems = []
                for (let j = 0; j < 5; j++) {
                    const card = cards[5 * i + j]
                    let color = translateColor(card.color)

                    const canClick = hasTurn && !card.isRevealed && !isSpymaster && !isOver

                    let borderable = canClick ? "borderable" : ""
                    const clickEffect = canClick ? makeMove(5 * i + j) : null

                    const style = {}
                    // normal view, spymaster view, game over view
                    if (card.isRevealed) {
                        style.background = color 
                        if (card.color !== 'black') style.color = 'rgb(55, 55, 55)'
                    } else if (isSpymaster || isOver) {
                        style.color = color
                    }

                    rowItems.push(
                        <div key={j} className={"card " + borderable} onClick={clickEffect} style={style}>
                            {/* <div> */}
                                {card.word}
                            {/* </div> */}
                        </div>)
                }
                grid.push(
                    <div key={i} className="card-row">
                        {rowItems}
                    </div>
                )
            }
        }
        return (
            <ul className="card-container">
                {grid}
            </ul>
        );
    }
}

export default Board;