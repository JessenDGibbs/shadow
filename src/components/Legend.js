import React from 'react';
import './Legend.css';

const Legend = ({ items }) => {
  return (
    <div className="legend">
      {items.map((item, index) => (
        <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <svg width="20" height="20">
            <circle cx="10" cy="10" r="5" fill={item.color} />
          </svg>
          <span style={{ marginLeft: '5px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;