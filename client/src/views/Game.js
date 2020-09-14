import React from 'react';
import ReactMapboxGl, {Layer, Feature } from 'react-mapbox-gl';
import "../custom.scss";
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
            initialized: false,
            loading: true,
            isNewFact: false
        }
    }

    componentDidMount() {
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
                loading: false
            });
        });
        this.getFacts()
        this.getNextFact()

    }

    logResponse = (correct) => {
        this.setState({loading: true})
        fetch('/logresponse', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: {
                'correct' : correct
            }
        }).then(res => res.json()).then(data => {
            this.setState({loading: false})
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
                loading: false
            });
        });
    }

    getFacts = () => {
        fetch('/facts').then(res => res.json()).then(data => {
            this.setState({facts: data.facts});
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
                <div className="vote-panel">
                    <h1>What's the name of this city?</h1>
                    <p>(Hint: it's {this.state.currentFact[2]}{this.state.isNewFact ? "*" : ""})</p>
                    <p>Long: {this.state.lat}</p>
                    <p>Lat: {this.state.lng}</p>
                    <div className="filler-20"></div>
                    <div className="max-400">
                        {this.state.loading ? <div className="loading">Fetching...</div> : this.state.facts.map(fact => {
                            return <Button variant="blue" size="lg" color="blue" block onClick={this.logResponse} key={fact[0]}>{fact[2]}</Button>
                        })}
                        <div className="filler-20"></div>
                    </div>
                </div>
            </div>
        )
    }
}