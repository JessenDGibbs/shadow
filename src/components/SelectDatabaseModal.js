import React, { useState } from 'react';
import { useMyContext } from '../contexts/Context';
import Modal from "./SourcesModal";
import './SelectDatabaseModal.css';

function SelectDatabaseModal() {
  const { handleSelectDB, setDB} = useMyContext();
  const [isOpen, setIsOpen] = useState(false);
  const [db, setInput] = useState('');

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  if (!isOpen) return <button onClick={handleOpen} className='database-button'>Select Database</button>;

  return (
    <Modal onClose={handleClose}>
        <h2>Select Database</h2>
        <input type="text" value={db} onChange={(e) => setInput(e.target.value)} placeholder="Database name" />
        <button onClick={() => { handleSelectDB(db); handleClose(); }}>Select</button>
        <button onClick={handleClose}>Close</button>
        
    </Modal>
  );
}

export default SelectDatabaseModal;