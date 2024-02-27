import React, { useState, useEffect } from "react";
import SocketIOClient from "socket.io-client";
import "regenerator-runtime/runtime";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import TextToSpeech from "./TextToSpeech";

const socket = SocketIOClient("http://192.168.1.14:3000");
const deviceThreadId = { deviceThreadId: "11" };

const sendMessage = (msg) => {
  console.log("message");
  let request = { deviceThreadId: "11", message: msg };
  console.log("request ===================", request);
  socket.emit("request", request);
};
function App() {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [text, setText] = useState("");

  // useEffect(() => {

  //   return () => {
  //     synth.cancel();
  //   };
  // }, [text]);

  const handlePlay = (text) => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);

    setUtterance(u);

    synth.speak(utterance);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;

    synth.pause();

    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();

    setIsPaused(false);
  };

  useEffect(() => {
    socket.emit("register", deviceThreadId);
    SpeechRecognition.startListening({ continuous: true });
  }, []);

  const commands = [
    {
      command: "salut *",
      callback: (text) => {
        alert(text);
        console.log("text", text);
        sendMessage(text);
        socket.on("response", (r) => {
          console.log("respons", r);
          setText(r);

          handlePlay(r);
        });
      },
    },
    {
      command: "reset *",
      callback: (text) => {
        console.log("text", text);
      },
    },
  ];
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <>
      <p>Microphone: {listening ? "on" : "off"}</p>

      <p>{transcript}</p>
      <TextToSpeech text={"where the fuck are you  ?"} />
    </>
  );
}

export default App;
