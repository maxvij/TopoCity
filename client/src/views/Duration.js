import React, { useState } from "react";
import RubberSlider from "@shwilliam/react-rubber-slider";

import "@shwilliam/react-rubber-slider/dist/styles.css";

export default function App() {
  const [value, setValue] = useState(50);

  return (
    <div className="app">
      <h1 className="title">rubber-slider</h1>
      <RubberSlider
        width={250}
        value={value}
        onChange={setValue}
        min={1}
        max={100}
      />
      <p className="rating-value">{value}</p>
    </div>
  );
}
