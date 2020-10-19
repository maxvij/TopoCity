import React from "react"
import PropTypes from "prop-types";

export default class LogPanel extends React.Component {
    render() {
        return <div className="logger-panel">
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
                {console.log(this.props.activationLevels)}
                {(typeof(this.props.activationLevels) !== 'undefined' && (this.props.activationLevels !== null)) && this.props.activationLevels.map((activation, index) => {
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
                {console.log(this.props.responses)}
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
                {typeof(this.props.response) !== 'undefined' && this.props.responses.map((response, index) => {
                    return (<div className="row" key={index}>
                        <div className="col-3">
                            <p>{response[0][2]}</p>
                        </div>
                        <div className="col-3">
                            <p>{Math.round((response[1] + Number.EPSILON) * 1000) / 1000}</p>
                        </div>
                        <div className="col-3">
                            <p>{Math.round(response[2])}</p>
                        </div>
                        <div className="col-3">
                            <p>{response[3] === true ? "correct" : "incorrect"}</p>
                        </div>
                    </div>)
                })}
            </div>
        </div>
    }
}

LogPanel.propTypes = {
    activationLevels: PropTypes.array,
    responses: PropTypes.array
}