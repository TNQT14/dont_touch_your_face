import React, { useEffect, useRef } from 'react'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import { Howl, Howler } from 'howler';
import './App.css';
// import soundURL from './assets/hey_thaitnq.mp3'

// var sound = new Howl({
//   src: [soundURL]
// });

// sound.play();

const NOT_TOUCH = 'not_touch';
const TOUCHED = 'touched';
const TRAIN_TIME = 50;
function App() {

  const classifier = useRef();
  const mobilenetModule = useRef();
  const video = useRef();

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {
            video: true
          },
          stream => {
            video.current.srcObject = stream;
            video.current.addEventListener('loadedata', resolve);
          },
          error => reject(error)
        )
      } else {
        reject();
      }
    })
  }

  const init = async () => {
    console.log('init');
    await setupCamera();

    console.log('Success');

    classifier.current = await knnClassifier.create();

    mobilenetModule.current = await mobilenet.load();

    console.log('Setup done');
    console.log('Không chạm tay lên mặt và train1');
  }

  useEffect(() => {
    init();

    return () => {

    }
  }, []);

  const train = async label => {
    console.log(`[${label} Đang train]`)
    for (let i = 0; i < TRAIN_TIME; i++) {
      console.log(`Progress ${parseInt((i + 1) / TRAIN_TIME * 100)}%`);
      await training(label);
    }
  }

  const training = label => {
    return new Promise(async resolve => {
      const embedding = mobilenetModule.current.infer(
        video.current,
        true
      );

      classifier.current.addExample(
        embedding,
        label
      );

      await sleep(100);
      resolve();
    });
  }

  const sleep = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }


  return (
    <div className="main">
      <video
        ref={video}
        className="video"
        autoPlay
      />

      <div className="control">
        <button className="btn" onClick={() => train(NOT_TOUCH)}>Train 1</button>
        <button className="btn" onClick={() => train(TOUCHED)}>Train 2</button>
        <button className="btn" onClick={() => { }}>Run</button>
      </div>
    </div>
  );
}

export default App;
