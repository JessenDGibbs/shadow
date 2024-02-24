import React from 'react';
import './MediaGroup.css'; // Ensure this CSS file is used for styling

function MediaGroup({ files }) {
  return (
    <div className="media-group">
      {files.map((file, index) => {
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file);
        return (
          <div key={index} className="media-item">
            {isImage ? (
              <img src={file} alt={`Media ${index}`} />
            ) : (
              <object data={file} type="application/pdf" style={{ width: '100%', height: 'auto' }}>
                <p>Your browser does not support PDFs. <a href={file}>Download the PDF</a>.</p>
              </object>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MediaGroup;