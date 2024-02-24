import React from 'react';
import './TextGroup.css';

function TextGroup({ documents }) {
  return (
    <div className="text-group">
      {documents.map((doc, index) => (
        <div key={index} className="text-document">
          <p>{doc}</p>
        </div>
      ))}
    </div>
  );
}

export default TextGroup;