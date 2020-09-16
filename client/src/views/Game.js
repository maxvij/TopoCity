import React from 'react';
import ReactMapboxGl, {Layer, Feature } from 'react-mapbox-gl';
import Button from "react-bootstrap/Button";
import CountdownTimer from "react-component-countdown-timer";
import AnswerButton from "./AnswerButton";

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
})

export default class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lng: 4.8896900,
            lat: 52.3740300,
            zoom: 8,
            currentFact: {},
            facts: [],
            initialized: false,
            loading: true,
            isNewFact: false,
            secondsPassed: 0,
            intervalId: null,
            startTime: new Date(),
            responseTime: new Date(),
            firstStartTime: new Date(),
            activationLevels: []
        }
    }

    componentDidMount() {
        let intervalId = setInterval(this.addSecond, 1000);
        this.setState({intervalId: intervalId})
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId)
    }

    componentWillMount() {
        if(!this.state.initialized) {
            this.init()
        }
    }

    init = () => {
        fetch('/init').then(res => res.json()).then(data => {
            this.setState({
                initialized: true,
                loading: false,
            });
        });
        console.log('Initialized start time (ms): ', this.state.firstStartTime.getTime())
        this.getFacts()
        this.getNextFact()

    }

    addSecond = () => {
        this.setState({
            secondsPassed: this.state.secondsPassed+1
        });
    }

    resetTimer = () => {
        clearInterval(this.state.intervalId)
        let intervalId = setInterval(this.addSecond, 1000);
        this.setState({
            intervalId: intervalId,
            secondsPassed: 0
        })
    }

    logResponse = (correct) => {
        let startTime = this.state.startTime.getTime() - this.state.firstStartTime.getTime()
        let newResponseTime = new Date()
        console.log('LOGGING RESPONSE', correct)
        console.log('start time (ms): ', startTime)
        this.setState({
            loading: true,
            responseTime: newResponseTime
        })
        let responseTime = newResponseTime - this.state.firstStartTime.getTime()
        console.log('response time (ms): ', responseTime)
        let data = {
            'correct' : correct ? "true" : "false",
            'startTime' : startTime,
            'responseTime' : responseTime,
        }
        fetch('/logresponse', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => {
            this.setState({
                loading: false
            })
        })
        this.getNextFact()
        this.resetTimer()
    }

    logCorrectResponse = () => {
        this.logResponse(true)
    }

    logIncorrectResponse = () => {
        this.logResponse(false)
    }

    getNextFact = () => {
        this.setState({loading: true})
        fetch('/getnextfact').then(res => res.json()).then(data => {
            const splittedString = data.next_fact[1].split("-");
            this.setState({
                currentFact: data.next_fact,
                isNewFact: data.new,
                lng: Number(splittedString[0]),
                lat: Number(splittedString[1]),
                loading: false,
                startTime: new Date()
            });
        });
        this.getActivationLevels()
        console.log('new fact -- start time (ms): ', this.state.startTime.getTime())
    }

    getFacts = () => {
        fetch('/facts').then(res => res.json()).then(data => {
            this.setState({
                ...this.state,
                facts: data.facts
            });
        });
    }

    getActivationLevels = () => {
        console.log('Getting activation levels')
        fetch('/activationLog').then(res => res.json()).then(data => {
            console.log('DATA')
            console.log(data)
            this.setState({
                activationLevels: data
            });
        });
    }

    render () {
        return (
            <div>
                <Map
                    className="map-container"
                    containerStyle={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                    style="mapbox://styles/mapbox/streets-v11"
                    zoomLevel={9}
                    center={[this.state.lng, this.state.lat]}>
                </Map>
                <div className="timer-panel">
                    <CountdownTimer ref="countdown" count={600} size={12} hideDay hideHours noPoints labelSize={20} />
                </div>
                <div className="logger-panel">
                    <div className="row">
                        <div className="col-4">
                            <p><strong>Fact_id</strong></p>
                        </div>
                        <div className="col-4">
                            <p><strong>Answer</strong></p>
                        </div>
                        <div className="col-4">
                            <p><strong>Act. level</strong></p>
                        </div>
                    </div>
                    <p>{this.state.activationLevels.map((activation) => {
                        return (<div className="row">
                            <div className="col-4">
                                <p>{activation[0]}</p>
                            </div>
                            <div className="col-4">
                                <p>{activation[2]}</p>
                            </div>
                            <div className="col-4">
                                <p>{activation[3]}</p>
                            </div>
                        </div>)
                    })}</p>
                </div>
                <div className="vote-panel">
                    <h1>What's the name of this city?</h1>
                    <p>{this.state.secondsPassed} seconds passed</p>
                    <div className="filler-20"></div>
                    <div className="max-400">
                        {this.state.loading ? <div className="loading">Fetching...</div> : this.state.facts.map((fact, index) => {
                            return <AnswerButton key={index} name={fact[2]} correct={fact[2] === this.state.currentFact[2]} correctAction={this.logCorrectResponse} incorrectAction={this.logIncorrectResponse}>{fact[2]}</AnswerButton>
                        })}
                        <div className="filler-20"></div>
                    </div>
                </div>
            </div>
        )
    }
}