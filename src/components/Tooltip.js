import React from 'react';
import './Tooltip.css'; // Assuming you will create a separate CSS file for styling

const Tooltip = ({ content }) => (
  <div className="tooltip">{content}</div>
);

export default Tooltip;