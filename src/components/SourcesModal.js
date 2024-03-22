import React from 'react';
import './SourcesModal.css'; // CSS file for styling the modal
import { X } from 'react-feather';

function Modal({ children, onClose, developerText=true }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X/></button>
        {children}
        {developerText && (
          <p className="modal-developer-text">
            Want to build your own connection? Join Shadow's open-source community
          </p>
        )}
      </div>
    </div>
  );
}

export default Modal;