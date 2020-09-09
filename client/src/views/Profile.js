import React from 'react'
import Button from "react-bootstrap/Button";
import { Route, Link, BrowserRouter as Router } from 'react-router-dom';
import "../custom.scss";

class Profile extends React.Component {
  render() {
    return (
        <div className="center-box" >
            <h1>Hi, who are you?</h1>
            <div className="filler-40"></div>
            <div className="max-400">
                <Button variant="blue" size="lg" color="blue" block>
                Nick
                </Button>
                <Button variant="blue" size="lg" color="blue" block>
                Max
                </Button>
                <Button variant="blue" size="lg" color="blue" block>
                Karlijn
                </Button>               
                <Button  href="/name" variant="yellow" size="lg" color="blue" block>
                New Learner
                </Button>
                
            </div>
        </div>
        
    );
  }
}
export default Profile