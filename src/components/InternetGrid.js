import React from 'react';
import './InternetGrid.css'; // Assuming you will create a CSS file for styling

function InternetGrid() {
  // Example cards data or fetch from an API
  const cards = [
    { id: 1, title: 'Card 1', description: 'This is card 1.' },
    { id: 2, title: 'Card 2', description: 'This is card 2.' },
    { id: 3, title: 'Card 3', description: 'This is card 3.' },
    { id: 1, title: 'Card 1', description: 'This is card 1.' },
    { id: 2, title: 'Card 2', description: 'This is card 2.' },
    { id: 3, title: 'Card 3', description: 'This is card 3.' },
    { id: 1, title: 'Card 1', description: 'This is card 1.' },
    { id: 2, title: 'Card 2', description: 'This is card 2.' },
    { id: 3, title: 'Card 3', description: 'This is card 3.' },
    // Add more cards as needed
  ];

  return (
    <div className="carousel-container">
      <div className="carousel">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InternetGrid;