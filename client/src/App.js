import React from 'react';

import "./assets/sass/custom.scss";
import "./assets/sass/timer.sass";
import {Switch, Route, BrowserRouter} from "react-router-dom";
import Profile from "./components/Profile";
import Origin from "./components/Origin";
import Async from "./components/AsynLoader";
import Initialize from "./components/Initialize";
import Game from "./components/Game";
import Name from "./components/Name";
import Slider from "./components/Slider";
import Province from "./components/Province";

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Switch>
                    <Route exact path="/">
                        <Profile />
                    </Route>
                    <Route exact path="/origin">
                        <Origin />
                    </Route>
                    <Route exact path="/name">
                        <Name />
                    </Route>
                    <Route exact path="/slider">
                        <Slider />
                    </Route>
                    <Route exact path="/province">
                        <Province />
                    </Route>
                    <Route exact path="/origin2">
                        <Async />
                    </Route>
                    <Route exact path="/initialize">
                        <Initialize />
                    </Route>
                    <Route path="/game">
                        <Game />
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;