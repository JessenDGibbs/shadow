import React, { useState, useRef } from 'react';
import Modal from './SourcesModal'; // Assuming you have a generic Modal component
import './Assistant.css'; // CSS file for styling
import { Coffee } from 'react-feather';
import { callAssistant, sendToBackend } from '../api';
import ReactMarkdown from 'react-markdown';
import SimpleMDE from 'react-simplemde-editor';




function Assistant() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResearchDone, setIsResearchDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if the user is editing
  const [responseData, setResponseData] = useState('');
  const [input, setInput] = useState(''); // State for SimpleMDE inputs
  const workRef = useRef(null);
  const sampleRef = useRef(null);

  const handleResearch = async () => {
    const work = workRef.current.value;
    const sample = sampleRef.current.value;
    // Call your API endpoint here with work and sample as parameters
    // For demonstration, let's assume the API is called `callResearchAPI`
    try {
      const response = await callAssistant(work);
      setResponseData(response.data);
      setIsResearchDone(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = () => {
    // Implement save functionality here
    // For example, updating the context or state with the new content
    sendToBackend(responseData, "Assistant")
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    setIsModalOpen(false); // Close the modal after saving
  };

  const handleEdit = () => {
    setIsEditing(!isEditing); // User is now editing
    setInput(responseData); // Initialize input with the current response data
    setResponseData(input); // Update the response data with the new input
  };

  const handleBack = () => {
    setIsResearchDone(false);
  };

  return (
    <div className='assistant-container'>
      <button className="assistant-button" onClick={() => setIsModalOpen(true)}><Coffee size={20}/></button>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} developerText={false}>
          <h2 style={{marginTop: 0}}>Research Assistant</h2>
          {!isResearchDone ? (
            <>
              <label>What can I support you with?</label>
              <input type="text" ref={workRef} />
              <label>Optional writing sample (this will help me write in a style more familiar to you)</label>
              <textarea ref={sampleRef}></textarea>
              <button onClick={handleResearch} className="research-button">Research</button>
            </>
          ) : (
            <div>
              <div className='buttons-container'>
                <button onClick={handleBack} className="assistant-button" style={{display: isEditing ? 'none' : 'block'}}>Back</button>
                <button onClick={handleEdit} className="assistant-button">{isEditing ? 'Save Changes' : 'Edit'}</button>
                <button onClick={handleSave} className="assistant-button" style={{display: isEditing ? 'none' : 'block'}}>Save</button>
              </div>
              {isEditing ? (
                <SimpleMDE className="assistant-content" value={input} placeholder="Connect things and tell stories..." onChange={value => setInput(value)} />
              ) : (
                <ReactMarkdown className="assistant-content">{responseData}</ReactMarkdown>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default Assistant;