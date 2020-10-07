import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import CountdownTimer from "react-component-countdown-timer";
import AnswerButton from "../AnswerButton";
import {PlayArrow} from '@material-ui/icons';
import {Search} from '@material-ui/icons';
import {getShuffledAnswerOptions} from "../helpers/multiplechoice";
import Button from "react-bootstrap/Button";
import LogPanel from "../LogPanel";
import MapContainer from "./MapContainer";
import ErrorPanel from "./ErrorPanel";
import Feedback from "./Feedback";

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
        setInterval(this.getActivationLevel, 500);
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
        const multipleChoice = (<div className="vote-panel">
            <h1>What's the name of this city?</h1>
            <p>Activation level for this fact: <br /><strong>{this.state.activationLevel}</strong></p>
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
                                             isNew={(fact[2] === this.state.currentFact[2]) && this.state.isNewFact}
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
                    <Button variant="green" size="lg" color="blue" block onClick={this.markFactAsTrained}>Ok, got
                        it!</Button>
                    <div className="filler-20"></div>
                    <a onClick={this.endTraining}>Skip training</a>
                </div>
            </div>
        )

        const gameContent = (<div>
                <Feedback feedbackMessages={this.state.feedbackMessages} />
                <MapContainer center={[this.state.lng, this.state.lat]} activationLevels={this.state.activationLevels}/>
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
                            {multipleChoice}
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
            <MapContainer center={[this.state.lng, this.state.lat]} activationLevels={this.state.activationLevels}/>
            <div className="right-panel">
                {trainingChoice}
            </div>
        </div>)

        const trainingIntro = (
            <div className="center-box">
                <div className="max-400">
                    <h3>Welcome to TopoCity</h3>
                    <p>We will start with a training phase. <br /> Memorize each city name and location, before we start the
                        testing session of 10 minutes.</p>
                    <Button variant="green" size="lg" color="blue" block onClick={this.startTraining}>Start
                        training!</Button>
                </div>
            </div>
        )

        const gameIntro = (
            <div className="center-box">
                <div className="max-400">
                    <h3>Ready for the test?</h3>
                    <p>We will now start the testing phase. <br /> The testing session will take 10 minutes. <br /> Are you ready?</p>
                    <Button variant="green" size="lg" color="blue" block onClick={this.startGame}>Start
                        testing!</Button>
                </div>
            </div>
        )

        return (
            <div>
                {this.state.initialized === false ? <div className="center-box"><p>Initializing...</p></div> : <div>
                    {this.state.trainingStarted ? (this.state.trainingFinished ? (this.state.gameStarted ? gameContent : gameIntro) : trainingContent) : trainingIntro}
                </div>}
            </div>
        )
    }
}