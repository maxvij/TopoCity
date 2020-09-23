import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';
import Duration from './components/Duration';
import Fact from './components/Fact';
import Game from './components/Game';
import Name from './components/Name';
import Origin from './components/Origin';
import Profile from './components/Profile';
import Slider from './components/Slider';
import * as serviceWorker from './serviceWorker';

const routing = (
  <Router>
    <div>
      <Route path="/" component={App} />
      <Route path="/duration" component={Duration} />
      <Route path="/fact" component={Fact} />
      <Route path="/game" component={Game} />
      <Route path="/name" component={Name} />
      <Route path="/origin" component={Origin} />
      <Route path="/profile" component={Profile} />
      <Route path="/slider" component={Slider} />
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
