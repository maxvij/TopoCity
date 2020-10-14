import React, { Component } from 'react'
import {SingleSlider} from 'react-slider-kit';
import Button from 'react-bootstrap/Button';
import {withRouter} from 'react-router-dom';

class Slider extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      value: 0
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
    fetch("/initsession?duration=" + duration + "&province=" + province + "&user_id=" + user_id, {
      method: 'POST'
    })
    .then((resp) => resp.json())
      .then((result) => {
        // console.log(result.province);
        // console.log(result.duration);
        // console.log(result.learning_session_id);
        localStorage.setItem('topo_session_id', result)
        this.props.history.push("/initialize")
      });
  }

  render() {
    return (
        <div className="center-box" >
            <h1>How long do you want to study?</h1>
            <div className="filler-40"></div>
            <div className="max-400">         
             
            <SingleSlider
                min={1}
                max={30}
                step={1}
                start={15}
                tooltips={'always'}
                postfix='min'
                onChangeStart={() => console.log('start drag')}
                onChange={(value) => this.handleOnChange}
                onChangeComplete={this.handleOnChange}
            />     
            <div className="filler-40"></div>     
            <Button onClick={this.handleContinue} variant="yellow" size="lg" color="blue" block>
            Let's go!
            </Button>
            
            </div>
        </div>
       
    )
  }
}

export default withRouter(Slider);