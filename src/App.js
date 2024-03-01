import React, { useState, useEffect } from 'react';
import ShowComponent from './components/ShowComponent';
import UploadButton from './components/UploadButton';
import { pdfjs } from 'react-pdf';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css'; // Make sure this path is correct
import ConnectSources from './components/ConnectSources';
import { useMyContext } from './contexts/Context';
import CreateNoteButton from './components/CreateNoteButton';
import { Check } from 'react-feather';
import CalendarModal from './components/CalendarModal';
import BurgerMenu from './components/BurgerMenu'; // Assuming you have a BurgerMenu component
import { useMediaQuery } from 'react-responsive';



// add this line back into the nav-container class for animation: ${isNavVisible ? 'show' : 'hide'}


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


function App() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const { fileUploaded } = useMyContext();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const navContent = (
    <>
      <CalendarModal/>
      <CreateNoteButton/>
      <UploadButton/>
      <ConnectSources sources={[
        { name: 'Notion', id: 'notion' },
        { name: 'Google Docs', id: 'google-docs' },
        { name: 'Bear notes', id: 'bear-notes' },
        { name: 'reMarkable', id: 'remarkable' },
        { name: 'Slack', id: 'slack' },
        { name: 'Gmail', id: 'gmail' },
        { name: 'Evernote', id: 'evernote' },
        { name: 'Google drive', id: 'googledrive' },
        { name: 'Dropbox', id: 'dropbox' },
      ]} buttonText="Connect Sources" actionText={"Connect"} title={"Connect sources"} subtitle={"Select where you want to sync your thinking from"}/>
    </>
  );


  return (
      <Router>
          {fileUploaded && <div className="notification-popup"><Check size={"16px"}/>your files are uploaded and searchable</div>}
          <div className={`nav-container`} style={{padding: "20px", display: isNavVisible ? 'flex' : 'none', marginLeft: isMobile ? '0px' : '40px', marginRight: isMobile ? '0px' : '40px'}}>
          <img src="/logo.svg" alt="Logo" style={{ marginRight: "auto", width: "200px" }} onClick={() => window.location.href = "https://www.shadownotes.ai/"} />
          {isMobile ? <BurgerMenu>{navContent}</BurgerMenu> : navContent}
          </div>
        <div className="app-container" 
          style={{ marginTop: isNavVisible ? '10px' : '40px', marginLeft: isMobile ? '0px' : '40px', marginRight: isMobile ? '0px' : '40px'}}
           onMouseEnter={() => setIsNavVisible(false)} 
           onMouseLeave={() => setIsNavVisible(true)}
        >
          <div className="column"> 
              <ShowComponent />
          </div>
        </div>
      </Router>
  );
}

export default App;