import React from 'react';
import TextGroup from './TextGroup';
import MediaGroup from './MediaGroup';
import './GenWebpage.css'; // Import the CSS file


function GenWebpage({ data }) {
    console.log("\n\ngenerating webpage!\n\n")
  // Function to process and group data
  const processData = () => {
    const groupedData = {
      text: [],
      file: [],
    };

    // Check if data is defined and has metadatas
    if (data && data.metadatas && data.metadatas[0]) {
        console.log("\n\nthere is data!\n")
        data.metadatas[0].forEach((metadata, index) => {
          const item = {
            date: metadata.date,
            content: data.documents && data.documents[0] ? data.documents[0][index] : '',
            path: metadata.path,
          };
  
          if (metadata.type === 'text') {
            groupedData.text.push(item);
          } else if (metadata.type === 'file') {
            groupedData.file.push(item);
          }
        });
  
        // Sort each group by date
        Object.keys(groupedData).forEach((key) => {
          groupedData[key].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      }

    return groupedData;
  };

  const groupedData = processData();

  return (
    <div className="gen-webpage-container">
      {groupedData.file.length > 0 && (
        <MediaGroup files={groupedData.file.map(item => item.path)} />
      )}
      {groupedData.text.length > 0 && (
        <TextGroup documents={groupedData.text.map(item => item.content)} />
      )}
    </div>
  );
}

export default GenWebpage;