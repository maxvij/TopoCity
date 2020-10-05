import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import ReactMapboxGl, {Feature, Layer} from 'react-mapbox-gl';
import CountdownTimer from "react-component-countdown-timer";
import AnswerButton from "./AnswerButton";
import {PlayArrow} from '@material-ui/icons';
import {Search} from '@material-ui/icons';
import {getShuffledAnswerOptions} from "./helpers/multiplechoice";
import Button from "react-bootstrap/Button";
import LogPanel from "./LogPanel";

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    minZoom: 7,
    maxZoom: 9,
    scrollZoom: false,
    interactive: false,
})

export default class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lng: 4.8896900,
            lat: 52.3740300,
            zoom: 8,
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
        this.getActivationLevel()
        this.getActivationLevels()
    }

    getActivationLevel = () => {
        fetch('/getactivationlevel').then(res => res.json()).then(data => {
            this.setState({
                activationLevel: data.activation,
            });
        });
    }

    startGame = () => {
        this.setState({
            gameStarted: true
        })
        fetch('/start').then(res => res.json()).then(data => {
            console.log('Started model with start time: ', data)
        });
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

    render() {
        const multipleChoice = (<div className="vote-panel">
            <h1>What's the name of this city?</h1>
            <p>Last answer correct: {this.state.answerCorrect ? "yes" : "no"}</p>
            <p>Activation level for this fact: {this.state.activationLevel}</p>
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

        const mapBox = (<>
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
                    zoom={[8.5]}
                    center={[this.state.lng, this.state.lat]}>
                    <Layer type="symbol" id="marker" layout={{'icon-image':'za-provincial-2', 'icon-anchor':'center'}}>
                        <Feature coordinates={[this.state.lng, this.state.lat]} />
                    </Layer>
                    <Layer type="symbol" id="activecities" layout={{'icon-image':'rectangle-blue-2', 'icon-anchor':'center'}}>
                        {this.state.activationLevels.length > 0 && this.state.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] !== null)).map((activeCity) => {
                            let splittedString = activeCity[1].split('-')
                            return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                        })}
                    </Layer>
                </Map>
            </>
        )

        const gameContent = (<div>
                {mapBox}l
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
                        </Tab>
                        <Tab eventKey="inspect" title={<div><Search/> Inspect</div>}>
                            <LogPanel responses={this.state.responses} activationLevels={this.state.activationLevels}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )

        const trainingContent = (<div>
            {mapBox}
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