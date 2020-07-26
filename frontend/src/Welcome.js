import React, { Component } from 'react';
import './Welcome.css'
import { withRouter} from 'react-router-dom';
import {refineWords} from './utils';

class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            joiningExisting: "true",
            gameName: "",
            colors: ["red", "blue"],
            wordPack: "1",
            customWords: ""
        }

        this.handleSetGameName = this.handleSetGameName.bind(this);
        this.handleSubmitCurrentUser = this.handleSubmitCurrentUser.bind(this);
        this.setColor = this.setColor.bind(this);
        this.colorRadioButtons = this.colorRadioButtons.bind(this);
        this.handleSetJoiningExisting = this.handleSetJoiningExisting.bind(this);
        this.joiningExistingRadioButtons = this.joiningExistingRadioButtons.bind(this);
    }

    handleSetJoiningExisting(e) {
        this.setState({joiningExisting: e.target.value})
    }

    handleSetGameName(e) {
        this.setState({ gameName: e.target.value })
    }

    handleSubmitCurrentUser(e) {
        const { gameName, colors, joiningExisting, wordPack } = this.state
        const {currentUser, socket} = this.props
        e.preventDefault()
        if (joiningExisting === "true") {
            socket.emit('join lobby', { gameName, currentUser, colors, wordPack, customWords: [''] })
        }
        else {
            const {customWords, wordPack} = this.state
            const refinedWords = refineWords(customWords)
            if (!colors[0] || !colors[1] || (colors[0] === colors[1])
                || !currentUser.length || !gameName.length
                || (wordPack === '5' && refinedWords.length < 25)) return;
            socket.emit('join lobby', { gameName, currentUser, colors, wordPack, customWords: refinedWords })
        }
        this.props.history.push("/game")
    }
    
    setColor(idx) {
        return e => {
            let clone = [...this.state.colors]
            clone[idx] = e.target.value
            this.setState({colors: clone})
        }
    }

    setWordPack() {
        return e => {
            this.setState({wordPack: e.target.value})
        }
    }

    colorRadioButtons(idx) {
        const colors = ["red", "orange", "green", "blue", "purple", "pink"]
        return colors.map((c, i) => (
            <label key={i}>
                <input type="radio" className="form-check-input" value={c} checked={this.state.colors[idx] === c} onChange={this.setColor(idx)} />
                {c}
            </label>
        ))  
    }

    wordPackRadioButtons() {
        const labels = ["(Original)", "(Expansion)", "(Rock Climbing)", 
            "(Filtered Original + Expansion)", "Custom Words"]

        return ["1", "2", "3", "4", "5"].map((n, i) => (
            <>
                <label key={i}>
                    <input type="radio" className="form-check-input" value={n} checked={this.state.wordPack === n} onChange={this.setWordPack()} />
                    {n !== "5" ? `Pack ${n}` : null} {labels[parseInt(n)-1]}
                </label>
            </>
        ))
    }

    joiningExistingRadioButtons() {
        const { joiningExisting } = this.state
        const { handleSetJoiningExisting} = this
        return (
            <>
            <label >
                <input type="radio" className="form-check-input" value="false" checked={joiningExisting === "false"} onChange={handleSetJoiningExisting}/>
                Make New Game
            </label>
            <label>
                <input type="radio" className="form-check-input" value="true" checked={joiningExisting === "true"} onChange={handleSetJoiningExisting}/>
                Join Existing Game
            </label>
            </>
        )
    }

    render() {
        const {props, colorRadioButtons, handleSetGameName, handleSubmitCurrentUser, joiningExistingRadioButtons} = this
        const {gameName, joiningExisting} = this.state

        let newGameInputs;
        if (joiningExisting === "false") {
            const customWordInput = this.state.wordPack === "5" ? 
                (<textarea 
                    value={this.state.s} 
                    onChange={(e) => this.setState({customWords: e.target.value})}
                    placeholder={`Enter at least 25 words \n - separate words only with spaces (' ') \n - capitalization doesn't matter`} />)
                : null;
            newGameInputs = (<>
                {/* <div className="prompt">Team 1:</div>
                <div class="form-check">
                    {colorRadioButtons(0)}
                </div>
                <div className="prompt">Team 2: (must be different)</div>
                <div class="form-check">
                    {colorRadioButtons(1)}
                </div>  */}
                <div className="prompt">Word Pack:</div>
                <div className="form-check word-pack-options">
                    {this.wordPackRadioButtons()}
                    {customWordInput}
                </div>
            </>)
        }

        return (
            <div className="welcome">
                <div className="title">Code/\/ames</div>
                <form onSubmit={handleSubmitCurrentUser} >
                    <div className="form-check">
                        {joiningExistingRadioButtons()}
                    </div>
                    <div className="form-group">
                        <input type="text" onChange={props.handleSetCurrentUser} value={props.currentUser} placeholder="Your Name" className="form-control" />
                    </div>
                    <div className="form-group">
                        <input type="text" onChange={handleSetGameName} value={gameName} placeholder={joiningExisting === "true" ? "Your Room Code" : "Choose Room Code"} className="form-control" />
                    </div>

                    {newGameInputs}

                    <input className="btn btn-primary" type="submit" value="Submit" />
                </form>
                <div className="credits">
                    <a className="social-link" href="https://github.com/rjk79" target="_blank" rel="noopener noreferrer">
                        <img className="icon" src={require("./assets/images/github.png")} alt="github" />
                    </a>
                </div>
            </div>
        );
    }
}

export default withRouter(Welcome);