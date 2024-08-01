import React, { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import '@tensorflow/tfjs-backend-cpu';
import { Howl } from 'howler';
import { initNotifications, notify } from '@mycv/f8-notification';
import './App.css';
import soundURL from './assets/hey_thaitnq.mp3'

var sound = new Howl({
  src: [soundURL]
});


const NOT_TOUCH = 'not_touch';
const TOUCHED = 'touched';
const TRAIN_TIME = 50;


function App() {

  const classifier = useRef();
  const mobilenetModule = useRef();
  const video = useRef();
  const [touched, setTouched] = useState(false);
  const canPlaySound = useRef(true);

  const setupCamera = () => {
    console.log('init setupCamera');
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
            video.current.addEventListener('loadeddata', resolve);
          },
          error => reject(error)
        )
        console.log('init Done');
      } else {
        reject();
      }
      console.log('init Success');
    });
  }

  const init = async () => {
    console.log('init camera');
    try {
      // console.log('Success');
      await setupCamera();
      // console.log('Success');
    }
    catch (e) {
      console.log('Lỗi');
    }
    console.log('Setup Success');

    classifier.current = knnClassifier.create();

    mobilenetModule.current = await mobilenet.load();

    console.log('Setup done');
    console.log('Không chạm tay lên mặt và train1');

    initNotifications({ cooldown: 3000 });
  }

  useEffect(() => {
    init();

    sound.on('end', function () {
      canPlaySound.current = true;
      console.log('Finished!');
    });

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

  const run = async () => {
    const embedding = mobilenetModule.current.infer(
      video.current,
      true
    );

    const result = await classifier.current.predictClass(
      embedding
    );

    if (
      result.label === TOUCHED &&
      result.confidences[result.label] > 0.7
    ) {
      console.log('Touched');

      if (canPlaySound.current) {
        sound.play();
        canPlaySound.current = false;
      }

      notify('Bỏ tay ra', { body: 'Bạn vừa chạm tay vào mặt' });
      setTouched(true);
    }
    else {
      console.log('Not Touched');

      setTouched(false);
    }

    await sleep(200);

    run();

  }

  const sleep = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }


  return (
    <div className={`main ${touched ? 'touched' : ''}`}>
      <video
        ref={video}
        className="video"
        autoPlay
      />

      <div className="control">
        <button className="btn" onClick={() => train(NOT_TOUCH)}>Train 1</button>
        <button className="btn" onClick={() => train(TOUCHED)}>Train 2</button>
        <button className="btn" onClick={() => run()}>Run</button>
      </div>
    </div>
  );
}

export default App;
