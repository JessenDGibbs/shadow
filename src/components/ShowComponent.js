import React, { useState } from 'react';
import { callShowEndpoint, callReset } from '../api';
import DocumentCard from './DocumentCard';
import './ShowComponent.css'; 
import {Search, List, Grid } from 'react-feather';


function ShowComponent() {
  const [input, setInput] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [searchMode, setSearchMode] = useState('everything'); // Default to 'everything'
  const [viewMode, setViewMode] = useState('list'); // Default to 'list'
  const [isFiltered, setIsFiltered] = useState(false); // Default to 'list'
  const [selectedType, setSelectedType] = useState(null); // New state for tracking the selected document type


  
  function filterDataByType(data, type) {
    if (type === selectedType) {
      // If so, clear the filtered data and selected type to revert to unfiltered view
      setFiltered(null);
      setIsFiltered(false);
      setSelectedType(null);
    } else {
      // Your existing filtering logic
      const filteredData = {
        ids: [[]],
        distances: [[]],
        metadatas: [[]],
        documents: [[]],
        embeddings: data.embeddings,
        uris: data.uris,
        data: data.data
      };

      if (data.metadatas[0]) {
        data.metadatas[0].forEach((metadata, index) => {
          if (metadata.type === type) {
            filteredData.metadatas[0].push(metadata);
            if (data.ids && data.ids[0]) filteredData.ids[0].push(data.ids[0][index]);
            if (data.distances && data.distances[0]) filteredData.distances[0].push(data.distances[0][index]);
            if (data.documents && data.documents[0]) filteredData.documents[0].push(data.documents[0][index]);
          }
        });
      }
      // Update the state with the filtered data and mark the view as filtered
      setFiltered(filteredData);
      setIsFiltered(true);
      setSelectedType(type);
    }
  };

  function groupDocumentsByPath(data) {
    const groupedDocuments = {};
    if (data && data.metadatas[0] && data.documents[0]) {
      data.metadatas[0].forEach((metadata, index) => {
        const path = metadata.path;
        if (!groupedDocuments[path]) {
          groupedDocuments[path] = {
            metadatas: [],
            documents: []
          };
        }
        groupedDocuments[path].metadatas.push(metadata);
        groupedDocuments[path].documents.push(data.documents[0][index]);
      });

    // Sort each group by page number
    Object.keys(groupedDocuments).forEach((path) => {
      const group = groupedDocuments[path];
      // Create an array of indices based on the sorted order of pages
      const sortedIndices = group.metadatas
        .map((metadata, index) => ({ index, page: metadata.page }))
        .sort((a, b) => a.page - b.page)
        .map(sortedItem => sortedItem.index);

      // Apply the sorted order to both metadatas and documents
      groupedDocuments[path].metadatas = sortedIndices.map(index => group.metadatas[index]);
      groupedDocuments[path].documents = sortedIndices.map(index => group.documents[index]);
    });
  }
  return groupedDocuments;
  };

  const handleClick = () => {
    callShowEndpoint(input, searchMode)
      .then(response => {
        console.log("\n\n\nraw:\n",response.data,"\n\n\n")

        setRawData(response.data)
        console.log("\n\n\nraw data:\n",rawData,"\n\n\n")

        const grouped = groupDocumentsByPath(response.data)
        console.log("\n\n\ngrouped:\n",grouped,"\n\n\n")
        setResponseData(grouped);
        console.log(responseData)
      })
      .catch(error => {
        console.log(error);
      });
  };

  //add onClick={handleReset} back to the document-type-pill element to enable DB reset
  const handleReset = () => {
    callReset()
      .then(response => {
        console.log(responseData)
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Function to count document types
  const countDocumentTypes = () => {
    const counts = {};
    if (rawData && Array.isArray(rawData.metadatas[0]) && rawData.metadatas.length > 0) {
      rawData.metadatas[0].forEach(metadata => {
        if (metadata && metadata.type) {
          const type = metadata.type;
          counts[type] = counts[type] ? counts[type] + 1 : 1;
        }
      });
    }
    return counts;
  };

  return (
      <div className="show-component">
        <div className="button-group">
          <button onClick={() => {setIsFiltered(false); setSearchMode('everything');}} className={searchMode === 'everything' ? 'active' : ''}>Files</button>
          <button onClick={() => {setIsFiltered(false); setSearchMode('citations');}} className={searchMode === 'citations' ? 'active' : ''} style={{fontFamily: 'Comic Sans MS'}}>Annotations</button>
        </div>
        <div className="input-group"> 
          <input 
          type="text" 
          value={input} 
          placeholder='Search...' 
          onChange={e => setInput(e.target.value)} 
          className="text-input" 
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleClick();
            }
          }}/>
          <button 
            onClick={handleClick} className="action-button" ><Search className='icon'/></button>
        </div>
        <div className="counts-container">
          <div className="counts-pills">
            {Object.entries(countDocumentTypes()).map(([type, count]) => (
              <div key={type} className={`document-type-pill ${selectedType === type ? 'selected' : ''}`} onClick={() => filterDataByType(rawData, type)}>{`${type}: ${count}`}</div>
            ))}
            </div>
            <div className="view-toggle">
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List/></button>
            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><Grid /></button>
        </div>
        </div>
        {!rawData && (
            <div className="no-data-card">
                <h1> 🌚 Let's get started with Shadow notes</h1>
                <p style={{paddinTop: "20px"}}><b>This is just a demo and some actions will take a while, so hang tight. Image and PDF uploads can take beween 10 seconds to a minute depending on how many pages are in the PDF.</b></p>
                <ol className="get-started-list">
                  <li>Move your cursor to the top of the screen to view your tools. You can create a quick note, import images or PDFs, or connect files from sources like Notion or Dropbox. Any handwriting from uploaded documents can be found in the Annotations tab and all text is searchable.</li>
                  <li>Click the coffee cup to access your assistant. Tell it what you want help doing or preparing and it'll search across everything to pull together what you need.</li>
                  <li>Search for Files or annotations using the toggle. In file mode, you can enter annotation text into the search bar to pull up the file it's associated with (Try typing "anime" to start).</li>
                  <li>Hit the search icon without entering any search terms to see everything</li>
                  <li>In File search, if you click on PDF pages, you can view the entire PDF.</li>
                  <li>In Annotation search, click on the annotation to pull up the relevant page.</li>
                  <li>Checkout the activity calendar to find items by date and your recent activity</li>
                </ol>
                <p>Note: Unless you're Jessen, you won't be able to connect sources like Notion or Dropbox, but hopefully that'll be sorted out soon!</p>
    
            </div>
        )}
        {rawData && (
        isFiltered ? (
            <div className={viewMode === 'grid' ? 'documents-grid' : ''}>
            {filtered.documents[0].map((document, index) => (
                <DocumentCard key={index} document={document} metadata={filtered.metadatas[0][index]} id={filtered.ids[0][index]} />
            ))}
        </div>
        ) : (
            <div className={viewMode === 'grid' ? 'documents-grid' : ''}>
            {rawData.documents[0].map((document, index) => (
                <DocumentCard key={index} document={document} metadata={rawData.metadatas[0][index]} id={rawData.ids[0][index]} />
            ))}
        </div>
        )
      )}
      </div>
      
  );
}

export default ShowComponent;

