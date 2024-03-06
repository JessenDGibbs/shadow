import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './DocumentCard.css'; // Import the CSS file for styling
import ReactMarkdown from 'react-markdown';
import { X, Calendar, Trash } from 'react-feather';
import { sendToDelete } from '../api';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import ErrorBoundary from './ErrorBoundary';

// You need to set workerSrc to point to the PDF.js worker script.
// This is required for the library to work.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;



function DocumentCard({ document, metadata, id }) {
  const [showDocumentData, setShowDocumentData] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [showAllPages, setShowAllPages] = useState(false); // New state to manage visibility of all pages
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true); // Add this line
  const [error, setError] = useState('');



  
  useEffect(() => {
    const loadFile = async (attempt = 1) => {
      if (metadata.path) {
        try {
          const response = await fetch(`https://7c00-2605-8d80-1120-814-fdb6-19f7-c2e0-1c74.ngrok-free.app/getFile?file_path=${metadata.path}`);
          if (!response.ok) throw new Error('Network response was not ok.');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } catch (error) {
          if (attempt <= 3) { // Retry up to 3 times
            console.error(`Attempt ${attempt}: Failed to load PDF, retrying...`, error);
            setTimeout(() => loadFile(attempt + 1), 2000); // Wait 2 seconds before retrying
          } else {
            console.error('Failed to load PDF after 3 attempts:', error);
          }
        }
      }
    };
  
    loadFile();
  }, [metadata.path]); // Depend on `metadata.path` to re-run the effect when it changes
  
  useEffect(() => {
    const loadImage = async (attempt = 1) => {
      if (metadata.path) {
        try {
          const response = await fetch(`https://7c00-2605-8d80-1120-814-fdb6-19f7-c2e0-1c74.ngrok-free.app/getFile?file_path=${metadata.path}`);
          if (!response.ok) throw new Error('Network response was not ok.');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        } catch (error) {
          if (attempt <= 3) { // Retry up to 3 times
            console.error(`Attempt ${attempt}: Failed to load image, retrying...`, error);
            setTimeout(() => loadImage(attempt + 1), 2000); // Wait 2 seconds before retrying
          } else {
            console.error('Failed to load image after 3 attempts:', error);
          }
        }
      }
    };
  
    loadImage();
  }, [metadata.path]);


  const toggleModal = () => {
    if (!showModal) {
      setShowModal(!showModal);
    }
  };

  const closeModal = () => setShowModal(!showModal);
    
  
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

   // Function to handle page click
   const handlePageClick = () => {
    setShowAllPages(!showAllPages); // Show all pages when the first page is clicked
  };

  // Render logic based on `showAllPages`
  const renderPages = () => {
    if (showAllPages) {
      // Show all pages
      return Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} renderMode="canvas" onClick={handlePageClick} />
      ));
    } else {
      // Show only the first page
      return <Page pageNumber={metadata.page+1} renderMode="canvas" onClick={handlePageClick} />;
    }
  };
  
  const getMetadataTypeClass = (type) => {
    switch (type.toLowerCase()) {
        case 'text':
            return 'metadata-type-text';
        case 'file':
            return 'metadata-type-file';
        case 'notion':
            return 'metadata-type-notion';
        case 'dropbox':
            return 'metadata-type-dropbox';
        case 'annotation':
            return 'metadata-type-citation';
        default:
            return 'metadata-type-else'; // Default case if none match
    }
};
 



  const handleDelete = () => {
    sendToDelete(id);
    setIsVisible(false); // Hide the card
  };

  const renderFileContent = () => {

    const path = metadata.path.toLowerCase();
    if (path.endsWith('.pdf')) {
      // For PDF files, use an <embed> or <object> tag
      return <div className="pdf-container">
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(error) => setError('Error loading PDF document.')}>
        <ErrorBoundary>
          {renderPages()}
        </ErrorBoundary>
      </Document>
    </div>;
    } else if (path.match(/\.(jpeg|jpg|png)$/)) {
      // For image files, use an <img> tag
      return <img src={imageUrl} alt="Uploaded content" style={{ maxWidth: '100%', height: '750px' }} />;
    } else {
      // Fallback or message for unsupported file types
      return <p>File format not supported for preview.</p>;
    }
  };

  if (!isVisible) return null; // If not visible, don't render anything

  if (metadata.type === 'file' || metadata.type === 'Dropbox') {
    // Check if the file is a PDF
    if (metadata.path.endsWith('.pdf')) {
      return (
        <div className="document-card">
          <button onClick={() => setShowDocumentData(!showDocumentData)} className="toggle-document-btn">
            {showDocumentData ? 'Hide LLM interpretation' : 'Show LLM interpretation'}
          </button>
          {showDocumentData && <ReactMarkdown className="document-content">{document}</ReactMarkdown>}
          <div className="pdf-container" name="viewport" content="width=device-width, initial-scale=1">
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(error) => setError('Error loading PDF document.')}>
              <ErrorBoundary>
               {renderPages()}
              </ErrorBoundary>
            </Document>
          </div>
          <div className="metadata-container" >
            <p className={`metadata-type-pill ${getMetadataTypeClass(metadata.type)}`}>{metadata.type}</p>
            <p className="metadata-type"><Calendar size={16}/> {metadata.date}</p>
            <button className="delete-button icon-button" onClick={handleDelete}>
            <Trash size={16} />
          </button>
          </div>
        </div>
      );
    } else if (metadata.path.toLowerCase().match(/\.(jpeg|jpg|png)$/)) { // Check if the file is an image
      return (
        <div className="document-card">
          <button onClick={() => setShowDocumentData(!showDocumentData)} className="toggle-document-btn">
            {showDocumentData ? 'Hide LLM interpretation' : 'Show LLM interpretation'}
          </button>
          {showDocumentData && <ReactMarkdown className="document-content">{document}</ReactMarkdown>}
          <img src={imageUrl} alt="Uploaded content" className="uploaded-image" />
          <div className="metadata-container" >
            <p className={`metadata-type-pill ${getMetadataTypeClass(metadata.type)}`}>{metadata.type}</p>
            <p className="metadata-type"><Calendar size={16}/> {metadata.date}</p>
            <button className="delete-button icon-button" onClick={handleDelete}>
            <Trash size={16} />
            </button>
          </div>
        </div>
      );
    }
  } else if (metadata.type === 'Citation' || metadata.type === 'Annotation') {
    return (
      <div className="document-card" onClick={toggleModal} style={{fontFamily: 'Comic Sans MS', size: '24px', cursor: 'pointer', boxShadow: 'none', 'border': '2px dashed #e6e5d9'}}>
        <ReactMarkdown className="document-content">{document}</ReactMarkdown>
        {showModal && (
          <div className="modal-backdrop">
            <div className="document-modal">
                <button className="modal-close" onClick={closeModal}><X/></button>
                {renderFileContent()}
            </div>
        </div>
      )}
      <div className="metadata-container" >
          <p className={`metadata-type-pill ${getMetadataTypeClass(metadata.type)}`}>{metadata.type}</p>
          <p className="metadata-type"><Calendar size={16}/> {metadata.date}</p>
          <button className="delete-button icon-button" onClick={handleDelete}>
            <Trash size={16} />
          </button>
        </div>
    </div>
    );
  } else {
    return (
      <div className="document-card" style={{boxShadow: 'none', 'border': '2px dashed #e6e5d9'}}>
        <ReactMarkdown className="document-content">{document}</ReactMarkdown>
        <div className="metadata-container" >
          <p className={`metadata-type-pill ${getMetadataTypeClass(metadata.type)}`}>{metadata.type}</p>
          <p className="metadata-type"><Calendar size={16}/> {metadata.date}</p>
          <button className="delete-button icon-button" onClick={handleDelete}>
            <Trash size={16} />
          </button>
        </div>
      </div>
    );
  }
}

export default DocumentCard;