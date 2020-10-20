
import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import {ReactComponent as Loader} from '../assets/loader.svg';

function Initialize() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    useEffect(() => {
        let origin = localStorage.getItem('topo_origin')
        let user_id = localStorage.getItem('topo_user_id')
        const uriPrefix = (typeof (process.env.REACT_APP_API_HOST) !== 'undefined' ? process.env.REACT_APP_API_HOST : '')
        const uri = uriPrefix + '/initializeuser?cities=' + origin + '&user_id=' + user_id;
        fetch(uri, {
            method: 'post'
        })
            .then(res => res.json())
            .then(
                (result) => {
                    localStorage.setItem('topo_session_id', result.session_id)
                    setIsLoaded(true);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return (
            <div className="center-box">
                <div className="max-400">
                    <h2>Calculating distances to other cities and initializing individual forgetting rates for each
                        city...</h2>
                    <p>This might take a while. Sit back and relax.</p>
                </div>
                <div className="scene">
                    <Loader/>
                </div>
            </div>

        );
    } else {
        return (
            <Redirect to='../game'/>
        );
    }
}

export default Initialize;