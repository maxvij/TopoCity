import React from 'react';
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types"

export default class AnswerButton extends React.Component {
    render () {
        return (<Button variant="blue" size="lg" color="blue" block onClick={(this.props.correct ? this.props.correctAction : this.props.incorrectAction)}>{this.props.name}</Button>)
    }
}

AnswerButton.propTypes = {
    name: PropTypes.string,
    correct: PropTypes.bool
}