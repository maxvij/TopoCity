import React from 'react';
import {Feature, Layer} from "react-mapbox-gl";

export default class MapLayers extends React.Component {
    render() {
        return (<>
            <Layer type="symbol" id="alpha-green" layout={{'icon-image':'rectangle-green-2', 'icon-anchor':'center'}}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] > 0)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="symbol" id="alpha-red" layout={{'icon-image':'rectangle-red-2', 'icon-anchor':'center'}}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] < -0.5)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            <Layer type="symbol" id="alpha-yellow" layout={{'icon-image':'rectangle-yellow-2', 'icon-anchor':'center'}}>
                {this.props.activationLevels.length > 0 && this.props.activationLevels.filter(activation => (activation[3] !== "-inf" && activation[3] < 0 && activation[3] >= -0.5)).map((activeCity) => {
                    let splittedString = activeCity[1].split('-')
                    return <Feature key={activeCity[1]} coordinates={[Number(splittedString[0]), Number(splittedString[1])]} />
                })}
            </Layer>
            </>)
    }
}