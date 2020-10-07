import React from 'react';
import ReactMapboxGl, {Feature, Layer} from 'react-mapbox-gl';

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    minZoom: 7,
    maxZoom: 9,
    scrollZoom: false,
    interactive: false,
})

export default class MapContainer extends React.Component {
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
            center={this.props.center}>
            <Layer type="symbol" id="activecities-green" layout={{'icon-image':'rectangle-green-2', 'icon-anchor':'center'}}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] > 0)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="symbol" id="activecities-red" layout={{'icon-image':'rectangle-red-2', 'icon-anchor':'center'}}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] < -0.5)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="symbol" id="activecities-yellow" layout={{'icon-image':'rectangle-yellow-2', 'icon-anchor':'center'}}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] < 0 && activation[3] >= -0.5)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="symbol" id="marker" layout={{'icon-image':'br-state-2', 'icon-anchor':'center'}}>
                <Feature coordinates={this.props.center} />
            </Layer>
        </Map>
    }
}