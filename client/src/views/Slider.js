import React, { Component } from 'react'
import {SingleSlider} from 'react-slider-kit';
import Button from 'react-bootstrap/Button';
import "../custom.scss";

export default class SimpleExample extends Component {
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
                onChange={(value)=>console.log('drag value: ', value)}
                onChangeComplete={this.handleOnChange}
            />     
            <div className="filler-40"></div>     
            <Button href="../game" variant="yellow" size="lg" color="blue" block>
            Let's go!
            </Button>
            
            </div>
        </div>
       
    )
  }
}