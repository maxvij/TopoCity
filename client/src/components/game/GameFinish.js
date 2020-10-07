import React from 'react';
import Button from "react-bootstrap/Button";

export default class GameIntro extends React.Component {
    render() {
        return (<div className="center-box">
            <div className="max-400">
                <h3>Your time is up...</h3>
                <p>Thank you for participating.</p>
                <Button href="/" variant="green" size="lg" color="blue" block>Start another game!</Button>
            </div>
        </div>)
    }
}
