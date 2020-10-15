import React from 'react';
import Button from "react-bootstrap/Button";

export default class GameIntro extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'Logging your data...'
        }
    }
    componentDidMount() {
        fetch((typeof(process.env.REACT_APP_API_HOST) !== 'undefined' ? process.env.REACT_APP_API_HOST : '') + '/insertactivations')
        .then(res => res.json())
        .then((data) => {
            this.setState({ status: data })
            console.log(this.state.status)
        })
        .catch(console.log)
    }
    render() {
        return (<div className="center-box">
            <div className="max-400">
                <h3>Your time is up...</h3>
                <p>Thank you for participating.</p>
                <div className='filler-40'></div>
                <center><img src='https://media.giphy.com/media/AeWoyE3ZT90YM/giphy.gif' style={{borderRadius: "10px"}}width='400' alt="Thanks" /></center>
                <div className='filler-40'></div>
                <Button href="/" variant="green" size="lg" color="blue" block>Start another game!</Button>
            </div>
        </div>)
    }
}
