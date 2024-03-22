import React, { useState, useEffect } from 'react';
import ShowComponent from './components/ShowComponent';
import UploadButton from './components/UploadButton';
import { pdfjs } from 'react-pdf';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css'; // Make sure this path is correct
import ConnectSources from './components/ConnectSources';
import { useMyContext } from './contexts/Context';
import CreateNoteButton from './components/CreateNoteButton';
import { Check, Map as MapIcon } from 'react-feather';
import CalendarModal from './components/CalendarModal';
import BurgerMenu from './components/BurgerMenu'; // Assuming you have a BurgerMenu component
import { useMediaQuery } from 'react-responsive';
import Assistant from './components/Assistant';
import InternetGrid from './components/InternetGrid';
import D3Graph from './components/D3Graph';



// add this line back into the nav-container class for animation: ${isNavVisible ? 'show' : 'hide'}


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


function App() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const { fileUploaded, graphView, toggleInternetView, graphData } = useMyContext();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [user, setUser] = useState(null);


  function createGraphFromData(graphData) {

    const nodes = [];
    const links = [];
    const conceptIndexMap = new Map();

    if (graphData == null) {
      return {nodes, links}
    }
  
    // Create nodes for each unique concept in the documents list
    graphData.None.documents.forEach((doc, index) => {
      if (!conceptIndexMap.has(doc)) {
        conceptIndexMap.set(doc, nodes.length); // Map concept to its node index
        nodes.push({ id: `Concept ${nodes.length + 1}`, type: "concept", content: doc });
      }
    });
  
    // Create nodes for each note and links to associated concepts
    graphData.None.metadatas.forEach((metadata, index) => {
      const noteId = `Note ${index + 1}`;
      nodes.push({ id: noteId, type: "note", content: metadata.note, date: metadata.date });
  
      // Assuming each note is associated with one concept in the documents list at the same index
      const conceptDoc = graphData.None.documents[index];
      if (conceptIndexMap.has(conceptDoc)) {
        const conceptNodeId = nodes[conceptIndexMap.get(conceptDoc)].id;
        links.push({ source: noteId, target: conceptNodeId, value: 1 });
      }
    });
  
    return { nodes, links };
  }

  const { generated_nodes, generated_links } = createGraphFromData(graphData);

  function createLinksBasedOnDistance(nodes) {
    const links = [];
    nodes.forEach(node => {
      if (node.distance < 0.60) {
        links.push({ source: 'Document 1', target: node.id, value: 1 });
      }
    });
    links.push({ source: 'Document 7', target: 'Document 9', value: 1 });
    links.push({ source: 'Document 9', target: 'Document 10', value: 1 });
    links.push({ source: 'Document 9', target: 'Document 11', value: 1 });
    links.push({ source: 'Document 9', target: 'Document 12', value: 1 });
    links.push({ source: 'Document 9', target: 'Document 13', value: 1 });

    return links;
  }

  const nodes = [
    {id: 'Document 1', type: "concept", content: "Robitics", distance: 0.43},
    {id: 'Document 2', type: "file", content: "Exploring robotics and gaming enhances hands-on learning experience in introductory computing", distance: 0.1},
    {id: 'Document 3', type: "file", content: "Using games for teaching introductory computing improves attraction, retention, and education of new CS students", distance: 0.1},
    {id: 'Document 4', type: "file", content: "Integrating gaming context in introductory courses could similarly engage students as robotics context has", distance: 0.54},
    {id: 'Document 5', type: "file", content: "Four promising contexts for teaching introductory computing courses are visualization, multimedia, robotics, and games", distance: 0.13},
    {id: 'Document 6', type: "file", content: "Teaching computing in context makes topics concrete and directly relevant to students", distance: 0.13},
    {id: 'Document 7', type: "file", content: "Game design course at Bryn Mawr aimed to be accessible to a wider audience beyond CS majors", distance: 0.13},
    {id: 'Document 8', type: "file", content: "Diverse entry backgrounds of Bryn Mawr students show challenges and opportunities in CS education", distance: 0.13},
    {id: 'Document 9', type: "concept", content: "Game design", distance: 0.99},
    {id: 'Document 10', type: "file", content: "Everything is a remix", distance: 0.99},
    {id: 'Document 11', type: "file", content: "Creativity is combinatory uniqueness", distance: 0.99},
    {id: 'Document 12', type: "file", content: "Calmness is a superpower", distance: 0.99},
    {id: 'Document 13', type: "file", content: "A company is a superorganism", distance: 0.99},
  ];

  const links = createLinksBasedOnDistance(nodes)

  const handleLoginSuccess = (username) => {
    // Prepare the data to be sent in the request
    const userData = { username };
    console.log(userData)
    // Send the username to your Flask backend
    fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Assuming the backend responds with a message, and you want to set the user
      setUser({ username });
    })
    .catch(error => console.error('Error:', error));
  };

  const navContent = (
    <>
      <button className="graph-toggle" onClick={toggleInternetView}><MapIcon className='icon' size={20}/></button>
      <Assistant/>
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
          <div className={`nav-container`} style={{padding: '0px', paddingBottom: isMobile ? '0px' : '0px', display: 'flex', marginLeft: isMobile ? '0px' : '15px', marginRight: isMobile ? '0px' : '15px'}}>
          <img src="/logo.svg" alt="Logo" style={{ marginRight: "auto", width: "200px" }} onClick={() => window.location.href = "https://www.shadownotes.ai/"} />
          {isMobile ? <BurgerMenu>{navContent}</BurgerMenu> : navContent}
          </div>
        <div className="app-container" 
           onMouseEnter={() => setIsNavVisible(false)} 
           onMouseLeave={() => setIsNavVisible(true)}
        >
          <div className="column" style={{justifyContent: graphView ? 'space-between' : 'center'}}> 
              <ShowComponent />
              {graphView && <D3Graph data={graphData} />}

              {/* <InternetGrid /> */}
          </div>
        </div>
      </Router>
  );
}

export default App;