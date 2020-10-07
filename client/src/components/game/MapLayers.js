import React from 'react';
import {Feature, Layer} from "react-mapbox-gl";

export default class MapLayers extends React.Component {
    render() {
        return (<>
            <Layer type="circle" id="cities" paint={{
                "circle-radius": 4,
                "circle-color": "#000000"
            }}>
                {(typeof(this.props.facts) !== "undefined") && this.props.facts.map((fact, index) => {
                    let splittedString = fact[1].split('-')
                    return <Feature key={index} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="circle" id="alpha-green" paint={{
                "circle-radius": 6,
                "circle-color": "#28a745"
            }}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] > 0)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="circle" id="alpha-red" paint={{
                "circle-radius": 6,
                "circle-color": "#dc3545"
            }}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] < -0.5)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="circle" id="alpha-yellow" paint={{
                "circle-radius": 6,
                "circle-color": "#fd7e14"
            }}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] < 0 && activation[3] >= -0.5)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            </>)
    }
}