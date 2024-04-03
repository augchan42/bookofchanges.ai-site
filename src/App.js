import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(''); // Current transcription
  const [transcriptHistory, setTranscriptHistory] = useState([]); // History of all transcriptions

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
    const recognition = new speechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice recognition activated. Start speaking.');
    };

    recognition.onresult = (event) => {
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

    recognition.onend = () => {
      console.log('Voice recognition stopped.');
      // Check if the stopping is intentional or if it should restart
      if (isListening) {
        console.log('Restarting recognition.');
        recognition.start();
      }
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]);

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