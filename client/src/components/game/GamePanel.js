import AnswerButton from "../AnswerButton";
import React from "react";

export default class GamePanel extends React.Component {
    render() {
        return (<div className="vote-panel">
            <h1>What's the name of this city?</h1>
            <p>Activation level for this fact: <br /><strong>{this.props.activationLevel}</strong></p>
            <div className="filler-20"></div>
            <div className="max-400">
                {this.props.loading ?
                    <div className="loading">
                        <p>Fetching...</p>
                    </div>
                    : this.props.answerOptions.map((fact, index) => {
                        return <AnswerButton key={index} name={fact[2]}
                                             correct={fact[2] === this.props.currentFact[2]}
                                             correctAction={this.props.logCorrectResponse}
                                             incorrectAction={this.props.logIncorrectResponse}
                                             isNew={(fact[2] === this.props.currentFact[2]) && this.props.isNewFact}
                        >{fact[2]}</AnswerButton>
                    })}
                <div className="filler-20"></div>
            </div>
        </div>)
    }
}