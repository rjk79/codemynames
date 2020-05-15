class Card {
    constructor(color, word, idx) {
        this.isRevealed = false
        this.color = color
        this.word = word.toUpperCase()
        this.idx = idx
    }

    capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }
}

module.exports = Card