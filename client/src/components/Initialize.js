import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import { ReactComponent as Loader } from '../assets/loader.svg';


function Initialize() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
  
    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    useEffect(() => {
        const uri = 'http://localhost:5000/initializeuser?cities=Groningen,Amsterdam';
        fetch(uri, {
            method: 'post'
          })
        .then(res => res.json())
        .then(
          (result) => {
            setIsLoaded(true);

            // setItems(result.items);
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
            <div class="max-400">
              <h2>Calculating distances to other cities and initializing individual forgetting rates for each city...</h2>
            </div>
            <div className="scene">
            <Loader />
            </div>
        </div>
        
      );
    } else {
      return (
         <Redirect to='../game' />
      );
    }
  }
export default Initialize;