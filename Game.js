const WORDS = require('./constants')
const WORDS_1 = require('./constants')
const Card = require("./Card")
const Player = require("./Player")

class Game {
    constructor(id, color1, color2, wordPack, customWords) {
        this.id = id
        this.cards = []
        this.players = {}
        this.currentTurnColor = color1
        this.turnTime = 0
        this.winner = null
        this.mostRecentMove = null
        this.shouldChangeTurn = false
        this.color1 = color1
        this.color2 = color2
        this.wordPack = wordPack
        this.customWords = customWords

        const colors = [color1, color2, 'white', 'black']
        const amounts = [9, 8, 7, 1]
        for (let i=0; i<colors.length; i++) {
            const newCards = this.makeCards(colors[i], amounts[i])
            this.cards = this.cards.concat(newCards)
        }

        this.cards = this.shuffleCards(this.cards)
    }

    otherColor(color) {
        return color === this.color1 ? this.color2 : this.color1
    }

    shuffleCards(cards) {
        let res = []
        for (let i = 0; i < cards.length; i++) {
            let randomIdx = Math.floor(Math.random() * cards.length)
            while (res.includes(randomIdx)) {
                randomIdx = Math.floor(Math.random() * cards.length)
            }
            res.push(randomIdx)
        }
        res = res.map(i=>cards[i])
        return res
    }

    makeCards(color, amount) {
        const cards = this.cards
        let words;
        if (this.wordPack !== '5') {
            words = WORDS[this.wordPack]
        } else {
            words = this.customWords
        }
        let res = []
        for (let i = 0; i < amount; i++) {
            let randomIdx = Math.floor(Math.random() * words.length) //400 words. highest random # is ~399.999 => 399
            const chosenWords = cards.map(c => c.word).concat(res.map(c => c.word))

            while (chosenWords.includes(words[randomIdx].toUpperCase())) {
                randomIdx = Math.floor(Math.random() * words.length)
            }
            res.push(new Card(color, words[randomIdx], randomIdx))
        }
        return res
    }

    addPlayer(playerId, username) {
        let { players, color1 } = this
        players[playerId] = new Player(username, color1)
    }

    changeTurn() {
        this.currentTurnColor = this.otherColor(this.currentTurnColor)
        this.turnTime = 0
    }

    changeTeam(playerId) {
        let {players} = this
        players[playerId].color = this.otherColor(players[playerId].color)
    }

    setMostRecentMove(player, card) {
        let mostRecentMove = 'found a' + (player.color === card.color
            ? ' fellow spy!'
            : card.color === 'white'
                ? ' bystander.'
                : card.color === 'black'
                    ? 'n assassin'
                    : 'n enemy spy!'
        );
        mostRecentMove += `(${card.word.toUpperCase()})(${card.color})`;
        this.mostRecentMove = mostRecentMove;
    }

    makeMove(idx, playerId) {
        const player = this.players[playerId]
        const card = this.cards[idx]
        if (player.color === this.currentTurnColor) card.isRevealed = true

        this.setMostRecentMove(player, card)
        this.winner = this.findWinner()

        if (!this.winner && (player.color !== card.color)) {
            this.shouldChangeTurn = true
        }
        else {
            this.shouldChangeTurn = false
        }
    }

    findWinner() {
        const {color1, color2} = this
        if (this.cards.filter(c=>c.color === color1 && c.isRevealed).length === 9) {
            return color1
        }
        else if (this.cards.filter(c => c.color === color2 && c.isRevealed).length === 8) {
            return color2
        }
        else if (this.cards.filter(c => c.color === "black" && c.isRevealed).length) {
            return this.otherColor(this.currentTurnColor)
        }
        else {
            return null
        }
    }
}

module.exports = Game