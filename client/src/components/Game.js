import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import ReactMapboxGl from 'react-mapbox-gl';
import CountdownTimer from "react-component-countdown-timer";
import AnswerButton from "./AnswerButton";
import Fireworks from "./Fireworks";
import {PlayArrow} from '@material-ui/icons';
import {Search} from '@material-ui/icons';
import {getShuffledAnswerOptions} from "./helpers/multiplechoice";
import Button from "react-bootstrap/Button";

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
            responses: [],
            initialized: false,
            loading: true,
            training: true,
            trainingFacts: [],
            isNewFact: false,
            startTime: new Date(),
            responseTime: new Date(),
            firstStartTime: new Date(),
            activationLevels: [],
            answerCorrect: false,
            tab: 'play',
            answerOptions: []
        }
    }

    componentWillMount() {
        if (!this.state.initialized) {
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
        this.getFacts()
    }

    logResponse = (correct) => {
        let startTime = this.state.startTime.getTime() - this.state.firstStartTime.getTime()
        let newResponseTime = new Date()
        this.setState({
            loading: true,
            responseTime: newResponseTime,
            answerCorrect: correct
        })
        let responseTime = newResponseTime - this.state.firstStartTime.getTime()
        let data = {
            'correct': correct ? "true" : "false",
            'startTime': startTime,
            'responseTime': responseTime,
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
                startTime: new Date(),
                answerOptions: getShuffledAnswerOptions(this.state.facts, data.next_fact)
            });
        });
        this.getResponses()
        this.getActivationLevels()
    }

    startTraining = () => {
        let trainingFact = this.state.trainingFacts[0]
        const splittedString = trainingFact[1].split("-");
        this.setState({
            currentFact: trainingFact,
            lng: Number(splittedString[0]),
            lat: Number(splittedString[1]),
        })
    }

    endTraining = () => {
        this.getNextFact()
        this.setState({
            training: false,
            trainingFacts: [],
        })
    }

    getFacts = () => {
        fetch('/facts').then(res => res.json()).then(data => {
            this.setState({
                facts: data.facts,
                trainingFacts: data.facts
            });
            this.startTraining()
            // this.getNextFact()
        });
    }

    getResponses = () => {
        fetch('/responses').then(res => res.json()).then(data => {
            this.setState({
                responses: data.responses
            });
        });
    }

    getActivationLevels = () => {
        fetch('/activationLog').then(res => res.json()).then(data => {
            this.setState({
                activationLevels: data
            });
        });
    }

    markFactAsTrained = () => {
        if(this.state.trainingFacts.length === 1) {
            this.endTraining()
        } else {
            let slicedTrainingFacts = this.state.trainingFacts.slice(0, 0).concat(this.state.trainingFacts.slice(1, this.state.trainingFacts.length))
            let trainingFact = slicedTrainingFacts[0]
            const splittedString = trainingFact[1].split("-");
            this.setState({
                trainingFacts: slicedTrainingFacts,
                currentFact: trainingFact,
                lng: Number(splittedString[0]),
                lat: Number(splittedString[1]),
            })
        }
    }

    render() {
        const multipleChoice = (<div className="vote-panel">
            <h1>What's the name of this city?</h1>
            <p>Last answer correct: {this.state.answerCorrect ? "yes" : "no"}</p>
            <div className="filler-20"></div>
            <div className="max-400">
                {this.state.loading ?
                  <div className="loading">
                      <p>Fetching...</p>
                  </div>
                  : this.state.answerOptions.map((fact, index) => {
                      return <AnswerButton key={index} name={fact[2]}
                                           correct={fact[2] === this.state.currentFact[2]}
                                           correctAction={this.logCorrectResponse}
                                           incorrectAction={this.logIncorrectResponse}
                                           isNew={fact[2] === this.state.currentFact[2] && this.state.isNewFact}
                      >{fact[2]}</AnswerButton>
                  })}
                <div className="filler-20"></div>
            </div>
        </div>);

        const trainingChoice = (<div className="vote-panel">
              <h1>The name of this city is:</h1>
              <p>{this.state.currentFact[2]}</p>
              <div className="filler-20"></div>
              <div className="max-400">
                  <Button variant="green" size="lg" color="blue" block onClick={this.markFactAsTrained}>Ok, got it!</Button>
                  <div className="filler-20"></div>
                  <a onClick={this.endTraining}>Skip training</a>
              </div>
          </div>
        )

        return (
            <div>
                {this.state.initialized === false ? <div className="center-box"><p>Initializing...</p></div> : <div>
                    <Map
                        className="map-container"
                        containerStyle={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                        style={"mapbox://styles/niklasmartin/ckf3wu17m13kb19ldd3g5rhd3"}
                        zoomLevel={11}
                        center={[this.state.lng, this.state.lat]}>
                    </Map>
                    {this.state.training === false ? <div className="timer-panel"><CountdownTimer ref="countdown" count={600} size={6} hideDay hideHours noPoints labelSize={20}/></div> : ''}
                    <div className="right-panel">
                        <Tabs
                            id="tabs"
                            activeKey={this.state.tab}
                            onSelect={(k) => this.setState({tab: k})}
                        >
                            <Tab eventKey="play" title={<div><PlayArrow/> Play</div>}>
                                {this.state.training === false ? multipleChoice : trainingChoice}
                            </Tab>
                            <Tab eventKey="inspect" title={<div><Search/> Inspect</div>}>
                                <div className="logger-panel">
                                    <div className="panel-wrapper">
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
                                        {this.state.activationLevels.map((activation, index) => {
                                            return (<div className="row" key={index}>
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
                                        })}
                                        <p>____Responses____</p>
                                        <div className="row">
                                            <div className="col-3">
                                                <p><strong>Answer</strong></p>
                                            </div>
                                            <div className="col-3">
                                                <p><strong>ST</strong></p>
                                            </div>
                                            <div className="col-3">
                                                <p><strong>RT</strong></p>
                                            </div>
                                            <div className="col-3">
                                                <p><strong>Correct</strong></p>
                                            </div>
                                        </div>
                                        {this.state.responses.map((response, index) => {
                                            return (<div className="row" key={index}>
                                                <div className="col-3">
                                                    <p>{response[0][2]}</p>
                                                </div>
                                                <div className="col-3">
                                                    <p>{response[1]}</p>
                                                </div>
                                                <div className="col-3">
                                                    <p>{response[2]}</p>
                                                </div>
                                                <div className="col-3">
                                                    <p>{response[3] === true ? "correct" : "incorrect"}</p>
                                                </div>
                                            </div>)
                                        })}
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>}
            </div>
        )
    }
}