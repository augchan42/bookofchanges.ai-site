import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(''); // Current transcription
  const [transcriptHistory, setTranscriptHistory] = useState([]); // History of all transcriptions

  const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition instance

  // Function to clear the screen
  const clearScreen = () => {
    setTranscript('');
    setTranscriptHistory([]);
  };
  
  // Save to local storage
  const saveTranscriptHistory = (transcriptHistory) => {
    localStorage.setItem('transcriptHistory', JSON.stringify(transcriptHistory));
  };

  // Load from local storage
  const loadTranscriptHistory = () => {
    const history = localStorage.getItem('transcriptHistory');
    console.log('Loaded history:', history); // Check the raw string from local storage
    const parsedHistory = history ? JSON.parse(history) : [];
    console.log('Parsed history:', parsedHistory); // Check the parsed array
    return parsedHistory;
  };

  useEffect(() => {
    // Automatically load the transcription history when the app loads
    const history = loadTranscriptHistory();
    setTranscriptHistory(history);
  }, []);

  useEffect(() => {
    // Only save to local storage if transcriptHistory is not empty
    if (transcriptHistory.length > 0) {
      saveTranscriptHistory(transcriptHistory);
    }
  }, [transcriptHistory]);

  useEffect(() => {
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new speechRecognition();

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      console.log('Voice recognition activated. Start speaking.');
    };

    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const newTranscript = event.results[current][0].transcript;
      if (event.results[current].isFinal) {
        // Update the transcript history with the new final transcript
        setTranscriptHistory(prevHistory => [...prevHistory, newTranscript]);
        setTranscript(''); // Optionally clear the current transcript
      } else {
        // Update the current transcript with the interim result
        setTranscript(newTranscript);
      }
      console.log(newTranscript);
    };

    recognitionRef.current.onend = () => {
      console.log('Voice recognition stopped.');
      // Check if the stopping is intentional or if it should restart
      if (isListening) {
        console.log('Restarting recognition.');
        recognitionRef.current.start();
      }
    };

    return () => {
      recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    // Start or stop recognition based on isListening state
    if (isListening) {
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
    }
  }, [isListening]); // Depend on isListening to control the recognition

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => setIsListening(prevState => !prevState)}>
          {isListening ? 'Stop Transcribing' : 'Start Transcribing'}
        </button>
        <button onClick={() => saveTranscriptHistory(transcriptHistory)}>Save History</button>
        <button onClick={() => setTranscriptHistory(loadTranscriptHistory())}>Load History</button>
        <button onClick={clearScreen}>Clear Screen</button>
        <p>Current Transcription: {transcript}</p>
        <div>
          <h2>Transcription History:</h2>
          {transcriptHistory.map((transcript, index) => (
            <p key={index}>{transcript}</p>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;