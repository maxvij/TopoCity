/* src/App.js */
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import Button from "react-bootstrap/Button";
import "../custom.scss";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const App = () => {
  const mapContainerRef = useRef(null);

  // initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // See style options here: https://docs.mapbox.com/api/maps/#styles
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [3.0368641, 52.1917338],
      zoom: 5,
    });

    // add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
  <div>
    <div className="map-container" ref={mapContainerRef} />
    <div className="vote-panel">
      <h1>What's the name of this city?</h1>
      <div className="filler-20"></div>
      <div className="max-400">
          <Button variant="blue" size="lg" color="blue" block>
          Amsterdam
          </Button>
          <Button variant="blue" size="lg" color="blue" block>
          Groningen
          </Button>
          <Button variant="blue" size="lg" color="blue" block>
          Utrecht
          </Button>               
          <div className="filler-20"></div>
      </div>
    </div>
  </div>

  
  );
};

export default App;