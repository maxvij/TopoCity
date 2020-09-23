import React from 'react';

import "./assets/sass/custom.scss";
import "./assets/sass/timer.sass";
import {Switch, Route, BrowserRouter} from "react-router-dom";
import Profile from "./components/Profile";
import Game from "./components/Game";

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Switch>
                    <Route exact path="/">
                        <Profile />
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