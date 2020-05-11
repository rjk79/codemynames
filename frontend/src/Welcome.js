import React, { Component } from 'react';
import './Welcome.css'
import { withRouter} from 'react-router-dom';

class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            joiningExisting: "true",
            gameName: "",
            colors: ["red", "blue"]
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
        const { gameName, colors, joiningExisting } = this.state
        const {currentUser, socket} = this.props
        e.preventDefault()
        if (joiningExisting === "true") {
            socket.emit('join lobby', { gameName, currentUser, colors: ["red", "red"] })
        }
        else {
            if (!colors[0] || !colors[1] || (colors[0] === colors[1]) || !currentUser.length || !gameName.length) return;
            socket.emit('join lobby', { gameName, currentUser, colors })
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

    colorRadioButtons(idx) {
        const colors = ["red", "orange", "green", "blue", "purple", "pink"]
        return colors.map((c, i) => (
            <label key={i}>
                <input type="radio" className="form-check-input" value={c} checked={this.state.colors[idx] === c} onChange={this.setColor(idx)} />
                {c}
            </label>

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

        let colorInputs = joiningExisting === "false" ? (<>
            <div>Team 1:</div>
            <div class="form-check">
                {colorRadioButtons(0)}
            </div>
            <div>Team 2: (must be different)</div>
            <div class="form-check">
                {colorRadioButtons(1)}
            </div>
        </>) : null

        return (
            <div className="welcome">
                <div className="title">Code/\/ames</div>
                <form onSubmit={handleSubmitCurrentUser} >
                    <div className="form-check">
                        {joiningExistingRadioButtons()}
                    </div>
                    <div className="form-group">
                        <input type="text" onChange={props.handleSetCurrentUser} value={props.currentUser} placeholder="Choose Your Username" className="form-control" />
                    </div>
                    <div className="form-group">
                        <input type="text" onChange={handleSetGameName} value={gameName} placeholder={joiningExisting === "true" ? "Enter Room Code" : "Choose Room Code"} className="form-control" />
                    </div>

                    {colorInputs}

                    <input className="btn btn-primary" type="submit" value="Submit" />
                </form>
                <div className="credits">Made by the Robby</div>
            </div>
        );
    }
}

export default withRouter(Welcome);