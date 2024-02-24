import React, { useState } from 'react';
import SaveThought from './SaveThought';
import ShowComponent from './ShowComponent';
import './ToggleDisplay.css'; // Import the CSS file here


function ToggleDisplay() {
  const [showBoth, setShowBoth] = useState(false);

  const toggleDisplay = () => {
    setShowBoth(!showBoth);
  };

  return (
    <div className="app-container">
      <button className="toggle-button" onClick={toggleDisplay}>
        {showBoth ? 'Show Only SaveThought' : 'Show Both'}
      </button>
      <div className="component-container">
        <SaveThought />
      </div>
      {showBoth && (
        <div className="component-container">
          <ShowComponent />
        </div>
      )}
    </div>
  );
}

export default ToggleDisplay;