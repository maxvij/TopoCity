import React, {useState, useEffect} from 'react';

import "./custom.scss";

function App() {
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        fetch('/time').then(res => res.json()).then(data => {
            setCurrentTime(data.time);
        });
    }, []);

    return (
        <div className="App">

        </div>
    );
}

export default App;
