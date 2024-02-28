import React, { useState, useRef } from 'react';
import Modal from './SourcesModal'; // Assuming you have a Modal component
import './ConnectSources.css'; // CSS file for styling
import { callNotion, callDropbox } from '../api';
import { Database } from 'react-feather';
import { useMyContext } from '../contexts/Context'; // Adjust the path as necessary



function ConnectSources({ sources, buttonText, actionText, title, subtitle }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [responseData, setResponseData] = useState('');
  const apiKeyRef = useRef(null);
  const pageIdRef = useRef(null);
  const { updateFileUploaded } = useMyContext();


  const handleUpload = async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    const apiKey = String(apiKeyRef.current.value);
    const pageId = String(pageIdRef.current.value);
    if (selectedSource && selectedSource.name === 'Dropbox') {
      console.log("\n\n\ncalling dropbox\n\n\n")
      console.log(pageId)
      try {
        const new_content = await callDropbox(pageId, apiKey);
        updateFileUploaded();
        console.log(new_content)
      } catch (error) {
        console.error(error);
      }
      
    } else {
      console.log("data stuff:", apiKey, pageId)
      callNotion(pageId)
        .then(response => {
          setResponseData(response.data);
          setIsConnected(true); // Set isConnected to true after successful API call
          console.log(responseData)
        })
        .catch(error => {
          console.log(error);
        });
      }
  };

  const handleConnectClick = (source) => {
    setSelectedSource(source);
  };

  


  const handleBackClick = () => {
    setIsConnected(false); // Set isConnected to true after successful API call
    setSelectedSource(null); // This will show all source cards again
    setIsConnected(false);
  };
  
  return (
    <div className='connect-sources-container'>
      <button className="connect-sources" onClick={() => setIsModalOpen(true)}><Database size={20} /></button>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2>{selectedSource ? `Connect ${selectedSource.name}` : title}</h2>
          {isConnected && (
                <div className="connection-chip">
                  Connected
                </div>
                
              )}
          <p>{selectedSource ? "" : subtitle}</p>
          {selectedSource ? (
            <>
                <div>
                <label className="input-label">Enter your {selectedSource.name} API key to open the connection:</label>
                <input className="api-key-input" type="text" placeholder="* * * *" ref={apiKeyRef}/>
                <label className="input-label">Enter your {selectedSource.name} page ID:</label>
                <input className="api-key-input" type="text" ref={pageIdRef}/>
                <h3 className="guide-text">How to get your API key</h3>
                <p>1. Go to {selectedSource.name} and find your profile settings.</p>
                <p>2. Click the integrations tab.</p>
                <p>3. Create a new API key and copy it here.</p>
                </div>
                <div className='buttons-container'>
                    <button onClick={handleBackClick} className="sources-button">Back</button>
                    <button onClick={handleUpload} className="sources-button">Submit</button>
                </div>

            </>
          ) : (
            <div className="sources-grid">
              {sources.map((source) => (
                <div key={source.id} className="source-card">
                  <h3>{source.name}</h3>
                  <button className="connect-sources-button" onClick={() => handleConnectClick(source)}>{actionText}</button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default ConnectSources;