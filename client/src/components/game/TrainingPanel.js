import React from 'react';
import Button from "react-bootstrap/Button";

export default class TrainingPanel extends React.Component {
    render() {
        return (<div className="vote-panel">
            <h1>The name of this city is:</h1>
            <p>{this.props.currentFact[2]}</p>
            <div className="filler-20"></div>
            <div className="max-400">
                <Button variant="green" size="lg" block onClick={this.props.markFactAsTrained}>Ok, got
                    it!</Button>
                <div className="filler-20"></div>
                <Button variant="yellow" size="lg" block onClick={this.props.endTraining}>Finish training</Button>
            </div>
        </div>)
    }
}

