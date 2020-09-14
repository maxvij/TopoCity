import React from 'react';
import mapboxgl from 'mapbox-gl';
import "../custom.scss";
import Button from "react-bootstrap/Button";

export default class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lng: 4.8896900,
            lat: 52.3740300,
            zoom: 8
        }
    }

    componentDidMount() {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });
    }

    render () {
        return (
            <div>
                <div className="map-container" ref={el => this.mapContainer = el}></div>
                <div className="vote-panel">
                    <h1>What's the name of this city?</h1>
                    <div className="filler-20"></div>
                    <div className="max-400">
                        <Button variant="blue" size="lg" color="blue" block>
                            Amsterdam
                        </Button>
                        <Button variant="blue" size="lg" color="blue" block>
                            Groningen
                        </Button>
                        <Button variant="blue" size="lg" color="blue" block>
                            Utrecht
                        </Button>
                        <div className="filler-20"></div>
                    </div>
                </div>
            </div>
        )
    }
}