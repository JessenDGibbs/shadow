import React from 'react';
import './SourcesModal.css'; // CSS file for styling the modal
import { X } from 'react-feather';

function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X/></button>
        {children}
        <p className="modal-developer-text">
          Are you a developer? Build your own connection and join Shadowboy's open-source community
        </p>
      </div>
    </div>
  );
}

export default Modal;