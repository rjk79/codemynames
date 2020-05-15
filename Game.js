const WORDS = require('./constants')
const WORDS_1 = require('./constants')
const Card = require("./Card")
const Player = require("./Player")

class Game {
    constructor(id, color1, color2, wordPack) {
        this.id = id
        this.cards = []
        this.players = {}      
        this.messages = []
        this.currentTurnColor = color1
        this.winner = null
        this.mostRecentMove = null
        this.shouldChangeTurn = false
        this.color1 = color1
        this.color2 = color2
        this.wordPack = wordPack

        const colors = [color1, color2, 'white', 'black']
        const amounts = [9, 8, 7, 1]
        for (let i=0; i<colors.length; i++) {
            const newCards = this.makeCards(colors[i], amounts[i], this.cards)
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

    makeCards(color, amount, cards) {
        const words = WORDS[this.wordPack]
        let res = []
        for (let i = 0; i < amount; i++) {
            let randomIdx = Math.floor(Math.random() * words.length) //400 words. highest random # is ~399.999 => 399
            const chosenWords = cards.map(c => c.word).concat(res.map(c => c.word))
            
            while (chosenWords.includes(words[randomIdx])) {
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
    }

    changeTeam(playerId) {
        let {players} = this
        players[playerId].color = this.otherColor(players[playerId].color)
    }

    setMostRecentMove(player, card) {
        if (player.color === card.color) {
            this.mostRecentMove = `found a fellow spy! (${card.word.toUpperCase()})`
        }
        else if (card.color === 'white') {
            this.mostRecentMove = `found a bystander. (${card.word.toUpperCase()})`
        }
        else if (card.color === 'black') {
            this.mostRecentMove = `found the assassin!!! (${card.word.toUpperCase()})`
        }
        else {
            this.mostRecentMove = `found an enemy spy! (${card.word.toUpperCase()})`
        }
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