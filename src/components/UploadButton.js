import React from 'react';
import { callUploadEndpoint, callConvertEndpoint } from '../api';
import './UploadButton.css'; 
import { FilePlus } from 'react-feather';
import { useMyContext } from '../contexts/Context'; // Adjust the path as necessary


function UploadButton() {
  const { updateFileUploaded } = useMyContext();

  //const handleUpload = async (event) => {
  async function handleUpload(event) {
    event.preventDefault();
    if (!event.target.files.length) {
      console.log('No file selected.');
      return;
    }
    const files = event.target.files;
    let index = 0; // Initialize cursor

    console.log("iterating")
    while (index < files.length) {
      const file = files[index];
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload PDF documents or images (JPEG/PNG).');
        index++; // Move to the next file
        continue; // Skip this file and continue with the next
      }

      try {
        const uploadResponse = await callUploadEndpoint(file);
        console.log("\n\n\n Converting...\n\n\n")
        const convertResponse = await callConvertEndpoint(uploadResponse.data.file_path);
        console.log(convertResponse.data);
        updateFileUploaded();
      } catch (error) {
        console.error(error);
      }
      index++; // Move to the next file
    }
  };


  return (
    <div className="upload-container">
      <button  className="file-upload-label">
        <label htmlFor="file-upload">
          <FilePlus size={20} className='icon'/>
        </label>
      </button>
      <input id="file-upload" type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleUpload} className="file-upload-input" multiple/>
    </div>
  );
}

export default UploadButton;