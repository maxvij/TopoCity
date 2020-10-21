import React from 'react';
import Button from "react-bootstrap/Button";

export default class GameFinish extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'Logging your data...',
            responses: [],
            percentageCorrect: 0,
            fastestRT: 0,
            slowestRT: 0,
            fastestResponse: '',
            slowestResponse: ''
        }
    }

    componentDidMount() {
        fetch('http://localhost:5000/insertactivations?session_id=' + localStorage.getItem('topo_session_id'))
        .then(res => res.json())
        .then((data) => {
            this.setState({ status: 'Your data has been logged!' })
            console.log('Success')
        })
        .catch(console.log)
        this.getResponses()
    }

    getResponses = () => {
        fetch('http://localhost:5000/getgrade?user_id=' + localStorage.getItem('topo_user_id'))
            .then(res => res.json())
            .then((data) => {
                this.calculateGrade(data)
            })
            .catch(console.log)
    }

    calculateGrade = (responseData) => {
        if(responseData.length > 0) {
            const initialTime = responseData[0][3]
            responseData.shift()
            const correctResponses = responseData.filter((response) => {
                return response[5] === 1
            })
            const sortedResponses = correctResponses.sort((a, b) => {
                return Number(a[4]) - Number(b[4])
            })
            const percentageCorrect = correctResponses.length / responseData.length * 100
            const fastestRT = sortedResponses[0]
            const slowestRT = sortedResponses[sortedResponses.length - 1]
            this.setState({
                responses: responseData,
                percentageCorrect: Math.round(percentageCorrect),
                fastestRT: fastestRT[4] - initialTime,
                fastestResponse: fastestRT[2],
                slowestRT: slowestRT[4] - initialTime,
                slowestResponse: slowestRT[2]
            })
        }
    }

    render() {
        const gradePanel = <div>
            <p>{this.state.percentageCorrect > 70 ? 'You did great!' : 'You\'re getting there...'}</p>
            <p><strong>{this.state.percentageCorrect}%</strong> of your answers were correct.</p>
            <p>Your fastest response (<strong>{this.state.fastestResponse}</strong>) had a RT of <strong>{this.state.fastestRT}</strong> ms.</p>
            <p>Your slowest response (<strong>{this.state.slowestResponse}</strong>) had a RT of <strong>{this.state.slowestRT}</strong> ms. {this.state.slowestRT > 10 ? 'Did you fall asleep?' : ''}</p>
        </div>

        return (<div className="center-box">
            <div className="max-400">
                <h3>Your time is up...</h3>
                <p>Thank you for participating.</p>
                {this.state.responses.length > 0 && gradePanel}
                <div className='filler-40'></div>
                <center><img src='https://media.giphy.com/media/AeWoyE3ZT90YM/giphy.gif' style={{borderRadius: "10px"}}width='400' alt="Thanks" /></center>
                <div className='filler-40'></div>
                <p>Could you please fill in our VERY SHORT survey?</p>
                <Button href="https://forms.gle/epP6oZRpNaPq7k229 " variant="green" size="lg" color="blue" block>Fill in our Google Form</Button>
            </div>
        </div>)
    }
}
