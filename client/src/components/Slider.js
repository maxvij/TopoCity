import React, {Component} from 'react'
import {SingleSlider} from 'react-slider-kit';
import Button from 'react-bootstrap/Button';
import {withRouter} from 'react-router-dom';

class Slider extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            value: 0,
            loading: false
        }
    }

    handleOnChange = (value) => {
        this.setState({
            value: value
        })
        localStorage.setItem('topo_duration', value);
    }
    handleContinue = () => {
        let duration = localStorage.getItem('topo_duration')
        let province = localStorage.getItem('topo_province')
        let user_id = localStorage.getItem('topo_user_id')
        if(duration === null) {
            duration = 10
        }
        this.setState({
            loading: true
        })
        fetch((typeof (process.env.REACT_APP_API_HOST) !== 'undefined' ? process.env.REACT_APP_API_HOST : '') + "/initsession?duration=" + duration + "&province=" + province + "&user_id=" + user_id, {
            method: 'POST'
        })
            .then((resp) => resp.json())
            .then((result) => {
                this.setState({
                    loading: false
                })
                localStorage.setItem('topo_session_id', result.learning_session_id)
                this.props.history.push("/initialize")
            });
    }

    render() {
        return (
            <div className="center-box">
                <h1>How long do you want to study?</h1>
                <p>For this User Models experiment, this variable will always be set to 10 minutes.</p>
                <div className="filler-40"></div>
                <div className="max-400">
                    <SingleSlider
                        min={1}
                        max={30}
                        step={1}
                        start={10}
                        tooltips={'always'}
                        postfix='min'
                        onChange={(value) => this.handleOnChange}
                        onChangeComplete={this.handleOnChange}
                    />
                    <div className="filler-40"></div>
                    <Button disabled={this.state.loading} onClick={this.handleContinue} variant="yellow" size="lg" color="blue" block>
                        {this.state.loading ? 'Initializing...' : "Let's go!"}
                    </Button>

                </div>
            </div>

        )
    }
}

export default withRouter(Slider);