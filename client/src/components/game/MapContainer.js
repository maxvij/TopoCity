import React from 'react';
import ReactMapboxGl, {Source, Layer} from 'react-mapbox-gl';
import MapLayers from "./MapLayers";

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    minZoom: 7,
    maxZoom: 9,
    scrollZoom: false,
    interactive: false,
})

export default class MapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            radius: 10,
            initialOpacity: 1,
            initialRadius: 15,
            framesPerSecond: 30,
            opacity: 1,
            maxRadius: 35,
            timerEl: null
        };
    }

    onStyleLoad = m => {
        this.map = m;
        this.animateCircle(0);
    }

    animateCircle = timestamp => {
        let timer = setTimeout(() => {
            if(typeof(this.map !== 'undefined') && this.map !== null) {
                requestAnimationFrame(this.animateCircle);
                let {
                    radius, opacity, maxRadius, framesPerSecond, initialOpacity, initialRadius
                } = this.state;

                radius += (maxRadius - radius) / framesPerSecond;
                opacity -= 0.95 / framesPerSecond;

                // mapbox gl will raise an error if opacity goes below 0
                if (opacity >= 0) {
                    this.map.setPaintProperty("point-blip", "circle-radius", radius);
                    this.map.setPaintProperty("point-blip", "circle-opacity", opacity);
                }

                // if opacity gets to zero, reset to initialRadius and initialOpacity
                if (opacity <= 0) {
                    this.setState({radius: initialRadius, opacity: initialOpacity});
                } else {
                    // update state with new radius and opacity
                    this.setState({radius: radius, opacity: opacity});
                }
            }
        }, 1000 / this.state.framesPerSecond);
        this.setState({
            timerEl: timer
        })
    }

    componentWillMount() {
        clearTimeout(this.state.timerEl)
    }

    componentWillUnmount() {
        clearTimeout(this.state.timerEl)
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.center !== nextProps.center;
    }

    render() {
        return <Map
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
            center={this.props.center}
            onStyleLoad={this.onStyleLoad}
        >
            <MapLayers activationLevels={this.props.activationLevels} facts={this.props.facts}/>
            <Source
                id="point"
                geoJsonSource={{
                    type: "geojson",
                    data: {
                        type: "Point",
                        coordinates: this.props.center
                    }
                }}
            />
            <Layer
                id="point-blip"
                type="circle"
                sourceId="point"
                paint={{
                    "circle-radius": this.state.initialRadius,
                    "circle-radius-transition": { duration: 0 },
                    "circle-opacity-transition": { duration: 0 },
                    "circle-color": "#007cbf"
                }}
            />
            <Layer
                id="point"
                type="circle"
                sourceId="point"
                paint={{
                    "circle-radius": this.state.initialRadius,
                    "circle-color": "#007cbf"
                }}
            />
        </Map>
    }
}