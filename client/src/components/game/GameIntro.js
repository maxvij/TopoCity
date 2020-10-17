import React from 'react';
import Button from "react-bootstrap/Button";

export default class GameIntro extends React.Component {
    render() {
        return (<div className="center-box">
            <div className="max-400">
                <h3>Ready for the test?</h3>
                <p>We will now start the testing phase. <br /> The testing session will take 10 minutes. <br /> Are you ready?</p>
                <Button variant="green" size="lg" color="blue" block disabled={!this.props.loading} onClick={this.props.startGame}>
                    {this.props.loading ? "..." : "Start testing!"}
                </Button>
            </div>
        </div>)
    }
}
