import React from "react"
import Lottie from "react-lottie";
import PropTypes from "prop-types";

export default class Fireworks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isStopped: false,
            isPaused: false,
        }
    }


    render() {
        const defaultOptions = {
            loop: false,
            autoplay: this.props.answerCorrect,
            animationData: require('../assets/animations/fireworks.json'),
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };

        console.log('autoplay', this.props.answerCorrect)

        return <Lottie options={defaultOptions}
                    height={400}
                    width={400}
                    isStopped={this.state.isStopped}
                    isPaused={this.state.isPaused}
                    direction={1}
            />
    }
}

Fireworks.propTypes = {
    answerCorrect: PropTypes.bool,
    answer: PropTypes.string
}