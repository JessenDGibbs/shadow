import React, { useState, useRef } from 'react';
import Modal from './SourcesModal'; // Assuming you have a generic Modal component
import './Assistant.css'; // CSS file for styling
import { Coffee, Send, RefreshCcw } from 'react-feather';
import { callAssistant, sendToBackend } from '../api';
import ReactMarkdown from 'react-markdown';
import SimpleMDE from 'react-simplemde-editor';



function Assistant() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSources, setSources] = useState(false);
  const [isResearchDone, setIsResearchDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if the user is editing
  const [responseData, setResponseData] = useState('');
  const [paths, setPaths] = useState([]);
  const [showPathsTooltip, setShowPathsTooltip] = useState(false); // State to toggle tooltip visibility
  const [input, setInput] = useState(''); // State for SimpleMDE inputs
  const [isLoading, setIsLoading] = useState(false);
  const workRef = useRef(null);
  const sampleRef = useRef(null);


  const handleResearch = async () => {
    const work = workRef.current.value;
    const sample = sampleRef.current.value;
    setIsLoading(true); // Start loading
    // Call your API endpoint here with work and sample as parameters
    // For demonstration, let's assume the API is called `callResearchAPI`
    try {
      const response = await callAssistant(work);
      setResponseData(response.data.assistant_response);
      setPaths(response.data.paths); // Save the paths list to the state
      setIsResearchDone(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading
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
  };

  const handleEdit = () => {
    setIsEditing(!isEditing); // User is now editing
    setInput(responseData); // Initialize input with the current response data
    setResponseData(input); // Update the response data with the new input
  };

  const handleBack = () => {
    setIsResearchDone(false);
  };

  const handleSources = () => {
    setSources(!showSources);
  };

  return (
    <div className='assistant-container'>
      <button className="assistant-button" onClick={() => setIsModalOpen(true)}><Coffee size={20} className='icon'/></button>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} developerText={false}>
          <h2 style={{marginTop: 0}}>Research Assistant</h2>
          {!isResearchDone ? (
            <>
              <label>What can I support you with?</label>
              <input type="text" ref={workRef} />
              {/* <label>Where should I pull from?</label>
              <div className="button-group">
                <button  className="collapse-type">Everything</button>
                <button  className="collapse-type">Files</button>
                <button  className="collapse-type">Notes</button>
                <button  className="collapse-type">Notion</button>
                <button  className="collapse-type">Dropbox</button>
                <button  className="collapse-type" style={{fontFamily: 'Comic Sans MS'}}>Annotations</button>
              </div> */}
              <label>Optional writing sample (this will help me write in a style more familiar to you)</label>
              <textarea ref={sampleRef}></textarea>
              <button onClick={handleResearch} className="research-button">
                {isLoading ? <RefreshCcw size={20} className='icon' style={{animation: "spin 0.7s linear infinite"}} /> : 'Research'}
              </button>            
          </>
          ) : (
            <div>
              <div className='buttons-container'>
                <button onClick={handleBack} className="assistant-button" style={{display: isEditing ? 'none' : 'block'}}>Back</button>
                <button onClick={handleEdit} className="assistant-button">{isEditing ? 'Save Changes' : 'Edit'}</button>
                <button onClick={handleSave} className="assistant-button" style={{display: isEditing ? 'none' : 'block'}}>Save</button>
                <button onClick={handleSources} className="assistant-button" style={{display: isEditing ? 'none' : 'block', border: "none"}}>Sources</button>
              </div>
              <div className="paths-grid" style={{display: showSources ? 'grid' : 'none'}}>
                {paths.map((path, index) => (
                  <div key={index} className="path-card">{path}</div>
                ))}
              </div>
              {isEditing ? (
                <SimpleMDE className="assistant-content" value={input} placeholder="Connect things and tell stories..." onChange={value => setInput(value)} />
              ) : (
                <ReactMarkdown className="assistant-content" >{responseData}</ReactMarkdown>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default Assistant;