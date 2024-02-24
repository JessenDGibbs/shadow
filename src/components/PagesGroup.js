import DocumentCard from './DocumentCard';
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';

const PagesGroup = ({ group }) => {
    const [currentPageNumber, setCurrentPageNumber] = useState(group.metadatas[0].page + 1); // +1 because PDF page numbers start at 1
  
    const renderPageButtons = () => {
      return group.metadatas.map((metadata, index) => (
        <button key={index} onClick={() => setCurrentPageNumber(metadata.page + 1)}>
          Page {metadata.page + 1}
        </button>
      ));
    };
  
    return (
      <div>
        <Document
          file={group.metadatas[0].path} // Assuming all pages in the group share the same path
        >
          <Page pageNumber={currentPageNumber} renderMode="canvas" />
        </Document>
        <div>{renderPageButtons()}</div>
      </div>
    );
  };
  
  export default PagesGroup;