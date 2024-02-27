import React, { useState } from 'react';
import { callShowEndpoint, callReset } from '../api';
import DocumentCard from './DocumentCard';
import './ShowComponent.css'; 
import {Search, List, Grid } from 'react-feather';


function ShowComponent() {
  const [input, setInput] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [searchMode, setSearchMode] = useState('everything'); // Default to 'everything'
  const [viewMode, setViewMode] = useState('list'); // Default to 'list'
  

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
          <button onClick={() => setSearchMode('everything')} className={searchMode === 'everything' ? 'active' : ''}>Files</button>
          <button onClick={() => setSearchMode('citations')} className={searchMode === 'citations' ? 'active' : ''} style={{fontFamily: 'Comic Sans MS'}}>Annotations</button>

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
              <div key={type} className="document-type-pill">{`${type}: ${count}`}</div>
            ))}
            </div>
            <div className="view-toggle">
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List/></button>
            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><Grid /></button>
        </div>
        </div>
        {rawData && (
            <div className={viewMode === 'grid' ? 'documents-grid' : ''}>
            {rawData.documents[0].map((document, index) => (
                <DocumentCard key={index} document={document} metadata={rawData.metadatas[0][index]} id={rawData.ids[0][index]} />
            ))}
        </div>
        )}
      </div>
      
  );
}

export default ShowComponent;

