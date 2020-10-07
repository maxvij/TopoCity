import React from 'react';
import Button from "react-bootstrap/Button";

export default class TrainingIntro extends React.Component {
    render() {
        return (<div className="center-box">
            <div className="max-400">
                <h3>Welcome to TopoCity</h3>
                <p>We will start with a training phase. <br /> Memorize each city name and location, before we start the
                    testing session of 10 minutes.</p>
                <Button variant="green" size="lg" color="blue" block onClick={this.props.startTraining}>Start
                    training!</Button>
            </div>
        </div>)
    }
}


