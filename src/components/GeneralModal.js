import React from 'react';
import ReactDOM from 'react-dom';
import './SourcesModal.css';
import { X } from 'react-feather';


const GeneralModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content" style={{maxWidth: "700px", overflowY: "auto"}}>
        <button className="modal-close" onClick={onClose}><X/></button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default GeneralModal;