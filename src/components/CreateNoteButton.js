import React, { useState } from 'react';
import GeneralModal from './GeneralModal';
import SaveThought from './SaveThought';
import './CreateNoteButton.css';
import { PlusSquare } from 'react-feather';


const CreateNoteButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button className="button" onClick={openModal}><PlusSquare size={20} className='icon'/></button>
      <GeneralModal isOpen={isModalOpen} onClose={closeModal}>
        <SaveThought />
      </GeneralModal>
    </>
  );
};

export default CreateNoteButton;