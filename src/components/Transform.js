import React, { useState } from 'react';
import Modal from './SourcesModal'; // Import the Modal from SourcesModal.js
import './Transform.css';

function Transform() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [response, setResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showTextView, setShowTextView] = useState(false);

  const handleCardBodyClick = () => {
    setShowTextView(true);
  };

  const handleItemClick = () => {
    setShowDetails(true);
  };
  
  const handleBackClick = () => {
    setShowDetails(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Simulate an API call response
    const apiResponse = {
        title: `Convo title: ${inputValue}`, // Use the inputValue for the title for demonstration
        date: "2023-04-01",
        mins: 62,
        location: "Montreal",
        people: 5,
        items: ["Memo"], // Example items
      };
    setResponse(apiResponse);
    // Optionally close the modal after submit
    // setIsOpen(false);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    if (chatInput.trim() !== '') {
      const updatedItems = [...response.items, chatInput];
      setResponse({...response, items: updatedItems});
      setChatInput('');
    }
    setIsChatOpen(false);
  };

  const handleChatInputChange = (event) => {
    setChatInput(event.target.value);
  };

  return (
    <div className="transform-container"> {/* Use a container class if needed */}
      <button className="transform-open-button" onClick={() => setIsOpen(true)}>Open Transform Modal</button>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <div className="modal-content">
            <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
            {!response && (
                <form onSubmit={handleSubmit} style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <input
                    className="transform-input" // Apply class to input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter transcript"
                />
                <button className="transform-submit-button" type="submit">Submit</button> {/* Apply class to button */}
                </form>
            )}
            <div className="response-section">
                {response && !showDetails && (
                    <div className="response-card" onClick={handleCardBodyClick}>
                    {isChatOpen ? (
                    <>
                        <div className="chat-title"><h3>Chat</h3></div>
                        <div className="chat-title">what do you want to do with this convo?</div>
                        <form onSubmit={handleChatSubmit} className="chat-interface">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={handleChatInputChange}
                            placeholder="Type here..."
                            autoFocus
                        />
                        </form>
                    </>
                    ) : (
                        <>
                        <div className="card-header">
                            <h3>{response.title}</h3>
                        </div>
                        <div className="items-container">
                            <div className="items-list">
                            {response.items.map((item, index) => (
                                <div key={index} className="item" onClick={handleItemClick}>{item}</div>
                            ))}
                            </div>
                            <button className="plus-button" onClick={handleOpenChat}>+</button>
                        </div>
                        <div className="card-footer">
                            <span>{response.date}</span>
                            <span>{response.mins}</span>
                            <span>{response.location}</span>
                            <span>Participants: {response.people}</span>
                        </div>
                        </>
                    )}
                    </div>
                )}
                {showDetails && (
                    <div className="details-view">
                    <button onClick={handleBackClick}>Back</button>
                    <div className="section"><h1>Image</h1></div>
                    <div className="section"><h2>Title</h2></div>
                    <div className="section"><h2>convo summary</h2></div>
                    <div className="section"><h2>key quotes</h2></div>
                    <div className="section"><h2>nutritional fact</h2></div>

                    {/* Add more sections as needed */}
                    </div>
                )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Transform;