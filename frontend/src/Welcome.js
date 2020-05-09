import React, { Component } from 'react';
import './Welcome.css'
import { withRouter} from 'react-router-dom';

class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameName: "",
            colors: [null, null]
        }

        this.handleSetGameName = this.handleSetGameName.bind(this);
        this.handleSubmitCurrentUser = this.handleSubmitCurrentUser.bind(this);
        this.setColor = this.setColor.bind(this);
        this.radioButtons = this.radioButtons.bind(this);
    }

    handleSetGameName(e) {
        this.setState({ gameName: e.target.value })
    }

    handleSubmitCurrentUser(e) {
        const { gameName, colors } = this.state
        const {currentUser, socket} = this.props
        e.preventDefault()
        if (!colors[0] || !colors[1] || (colors[0] === colors[1]) || !currentUser.length || !gameName.length) return;
        socket.emit('join lobby', { gameName, currentUser, colors })
        this.props.history.push("/game")
    }
    
    setColor(idx) {
        return e => {
            let clone = [...this.state.colors]
            clone[idx] = e.target.value
            this.setState({colors: clone})
        }
    }

    radioButtons(idx) {
        const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink"]
        return colors.map((c, i) => (
            <label key={i}>
                <input type="radio" class="form-check-input" value={c} checked={this.state.colors[idx] === c} onChange={this.setColor(idx, c)} />
                {c}
            </label>

        ))  
    }

    render() {
        const {props, radioButtons, handleSetGameName, handleSubmitCurrentUser} = this
        const {gameName} = this.state

        return (
            <div className="welcome">
                <div className="title">Code/\/ames</div>
                <form onSubmit={handleSubmitCurrentUser} >
                    <div className="form-group">
                        <input type="text" onChange={props.handleSetCurrentUser} value={props.currentUser} placeholder="Choose Username" className="form-control" />
                    </div>
                    <div className="form-group">
                        <input type="text" onChange={handleSetGameName} value={gameName} placeholder="Join / Create Room Code" className="form-control" />
                    </div>
                    <div>Team 1 Color: (pick random if joining existing game)</div>
                    <div class="form-check">
                        {radioButtons(0)}
                    </div>
                    <div>Team 2 Color: (must be different from other color. pick random if joining existing game)</div>
                    <div class="form-check">
                        {radioButtons(1)}
                    </div>
                    <div>Made by the Robby</div>
                    <input className="btn btn-primary" type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}

export default withRouter(Welcome);