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
        {this.props.activationLevels.map((activation, index) => {
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
        {this.props.responses.map((response, index) => {
          return (<div className="row" key={index}>
            <div className="col-3">
              <p>{response.fact.answer}</p>
            </div>
            <div className="col-3">
              <p>{response.start_time}</p>
            </div>
            <div className="col-3">
              <p>{response.rt}</p>
            </div>
            <div className="col-3">
              <p>{response.correct === true ? "correct" : "incorrect"}</p>
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