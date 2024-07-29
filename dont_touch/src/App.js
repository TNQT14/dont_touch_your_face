import React from 'react'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import { Howl, Howler } from 'howler';
import './App.css';
// import soundURL from './assets/hey_thaitnq.mp3'

// var sound = new Howl({
//   src: [soundURL]
// });

// sound.play();

function App() {
  return (
    <div className="main">
      <video
        className="video"
        autoPlay
      />

      <div className="control">
        <button className="btn">Train 1</button>
        <button className="btn">Train 2</button>
        <button className="btn">Run</button>
      </div>
    </div>
  );
}

export default App;
