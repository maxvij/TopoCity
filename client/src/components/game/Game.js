import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import CountdownTimer from "react-component-countdown-timer";
import {PlayArrow} from '@material-ui/icons';
import {Search} from '@material-ui/icons';
import {getShuffledAnswerOptions} from "../helpers/multiplechoice";
import LogPanel from "../LogPanel";
import MapContainer from "./MapContainer";
import ErrorPanel from "./ErrorPanel";
import Feedback from "./Feedback";
import GameIntro from "./GameIntro";
import TrainingIntro from "./TrainingIntro";
import TrainingPanel from "./TrainingPanel";
import GamePanel from "./GamePanel";

export default class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lng: 4.8896900,
            lat: 52.3740300,
            currentFact: {},
            activationLevel: 0,
            facts: [],
            responses: [],
            initialized: false,
            loading: true,
            trainingStarted: false,
            trainingFinished: false,
            gameStarted: false,
            trainingFacts: [],
            isNewFact: true,
            startTime: new Date(),
            responseTime: new Date(),
            firstStartTime: new Date(),
            activationLevels: [],
            answerCorrect: false,
            errorMessages: [],
            feedbackMessages: [],
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
        this.setState({
            initialized: true,
            loading: false,
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
        let responseTime = newResponseTime.getTime() - this.state.firstStartTime.getTime()
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
            this.getNextFact()
        }).catch((error) => {
            this.logError('Unable to log the response', error)
        });
    }

    logCorrectResponse = () => {
        this.showFeedback(true)
        this.logResponse(true)
    }

    logIncorrectResponse = () => {
        this.showFeedback(false)
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
        }).catch((error) => {
            this.logError('Unable to fetch the next fact', error)
        });
        this.getResponses()
        this.getActivationLevel()
        this.getActivationLevels()
    }

    getActivationLevel = () => {
        fetch('/getactivationlevel').then(res => res.json()).then(data => {
            this.setState({
                activationLevel: data.activation,
            });
        }).catch((error) => {
            this.logError('Unable to fetch the activation level', error)
        });
    }

    startGame = () => {
        this.setState({
            gameStarted: true
        })
        fetch('/start').then(res => res.json()).then(data => {
            console.log('Started model with start time: ', data)
        }).catch((error) => {
            this.logError('Unable to start the model', error)
        });
        setInterval(this.getActivationLevels, 500);
    }

    startTraining = () => {
        let trainingFact = this.state.trainingFacts[0]
        const splittedString = trainingFact[1].split("-");
        this.setState({
            currentFact: trainingFact,
            lng: Number(splittedString[0]),
            lat: Number(splittedString[1]),
            trainingStarted: true
        })
    }

    endTraining = () => {
        this.getNextFact()
        this.setState({
            training: false,
            trainingFinished: true,
            trainingFacts: [],
        })
    }

    getFacts = () => {
        fetch('/facts').then(res => res.json()).then(data => {
            this.setState({
                facts: data.facts,
                trainingFacts: data.facts
            });
        }).catch((error) => {
            this.logError('Unable to fetch facts', error)
        });
    }

    getResponses = () => {
        fetch('/responses').then(res => res.json()).then(data => {
            this.setState({
                responses: data.responses
            });
        }).catch((error) => {
            this.logError('Unable to fetch responses', error)
        });
    }

    getActivationLevels = () => {
        fetch('/activationLog').then(res => res.json()).then(data => {
            this.setState({
                activationLevels: data
            });
        }).catch((error) => {
            this.logError('Unable to fetch activation levels', error)
        });
    }

    markFactAsTrained = () => {
        if (this.state.trainingFacts.length === 1) {
            // Finish training
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

    logError = (errorMsg, error) => {
        console.log('Error: ', errorMsg)
        console.log('Error: ', error)
        let prevErrors = this.state.errorMessages
        prevErrors.push(errorMsg)
        this.setState({
            errorMessages: prevErrors
        })
    }

    showFeedback = (correct) => {
        let message = {
            correct: correct,
            message: correct ? 'Good job!' : 'Too bad...'
        }
        let prevMessages = this.state.feedbackMessages
        prevMessages.push(message)
        this.setState({
            feedbackMessages: prevMessages
        })
    }

    render() {
        const gameContent = (<div>
                <Feedback feedbackMessages={this.state.feedbackMessages} />
                <MapContainer center={[this.state.lng, this.state.lat]} activationLevels={this.state.activationLevels} facts={this.state.facts}/>
                <div className="timer-panel">
                    <CountdownTimer ref="countdown" count={600} size={6} hideDay hideHours
                                                             noPoints labelSize={20}/>
                </div>
                <div className="right-panel">
                    <Tabs
                        id="tabs"
                        activeKey={this.state.tab}
                        onSelect={(k) => this.setState({tab: k})}
                    >
                        <Tab eventKey="play" title={<div><PlayArrow/> Play</div>}>
                            <GamePanel activationLevel={this.state.activationLevel} loading={this.state.loading} answerOptions={this.state.answerOptions} currentFact={this.state.currentFact} isNewFact={this.state.isNewFact} logCorrectResponse={this.logCorrectResponse} logIncorrectResponse={this.logIncorrectResponse}/>
                            <ErrorPanel errorMessages={this.state.errorMessages} />
                        </Tab>
                        <Tab eventKey="inspect" title={<div><Search/> Inspect</div>}>
                            <LogPanel responses={this.state.responses} activationLevels={this.state.activationLevels}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )

        const trainingContent = (<div>
            <MapContainer center={[this.state.lng, this.state.lat]} activationLevels={this.state.activationLevels} facts={this.state.facts}/>
            <div className="right-panel">
                <TrainingPanel currentFact={this.state.currentFact} markFactAsTrained={this.markFactAsTrained} endTraining={this.endTraining}/>
            </div>
        </div>)

        return (
            <div>
                {this.state.initialized === false ? <div className="center-box"><p>Initializing...</p></div> : <div>
                    {this.state.trainingStarted ? (this.state.trainingFinished ? (this.state.gameStarted ? gameContent : <GameIntro startGame={this.startGame} />) : trainingContent) : <TrainingIntro startTraining={this.startTraining} />}
                </div>}
            </div>
        )
    }
}