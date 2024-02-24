import React, { useState } from 'react';
import { sendToBackend } from '../api';
import './SaveThought.css'; // Make sure this path is correct
import ReactMarkdown from 'react-markdown';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import axios from 'axios';
import { Check } from 'react-feather';



function SaveThought() {
  const [input, setInput] = useState(" ");
  const [isSaved, setIsSaved] = useState(false); // Add this line

  const handleClick = () => {
    console.log("logging input:\n\n")
    console.log(input)

    sendToBackend(input)
      .then(response => {
        console.log(response.data);
        setIsSaved(true); // Set isSaved to true upon successful save
        setTimeout(() => setIsSaved(false), 3000);
      })
      .catch(error => {
        console.log(error);
      });
  };



  return (
    <div className='thought-container'>
      {isSaved && ( // Conditionally render the "saved" banner
        <div className="saved-banner">
          Saved
        </div>
      )}
      <SimpleMDE value={input} placeholder="Connect things and tell stories..." onChange={setInput} />
      <button className='create-button' onClick={handleClick}>save</button>
    </div>
  );
}

export default SaveThought;