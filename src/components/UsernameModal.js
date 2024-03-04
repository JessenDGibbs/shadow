import React, { useState } from 'react';
import { X } from 'react-feather';

import '../components/UsernameModal.css'; // Adjust the path as necessary

function UsernameModal({ onSubmit }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={() => onSubmit(null)}><X/></button>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            <h2>Enter a username to get started</h2>
            <p>This will create a private database for you</p>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default UsernameModal;