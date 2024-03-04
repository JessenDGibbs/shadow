import React, { useState, useEffect } from 'react';
import './ThoughtsFeed.css'; // Create and import your CSS for styling

function ThoughtsFeed() {
  const [thoughts, setThoughts] = useState([]);

  // Simulate loading existing thoughts from a "file" on component mount
  useEffect(() => {
    const savedThoughts = JSON.parse(localStorage.getItem('thoughts') || '[]');
    setThoughts(savedThoughts);
  }, []);

  // Simulate saving a new thought to a "file"
  const saveThought = (newThought) => {
    const updatedThoughts = [...thoughts, newThought];
    localStorage.setItem('thoughts', JSON.stringify(updatedThoughts)); // Simulating file save with localStorage
    setThoughts(updatedThoughts);
  };

  // Example function to add a new thought - in a real app, this could be triggered by a form
  const handleAddThought = () => {
    const newThought = { id: thoughts.length + 1, text: `Thought ${thoughts.length + 1}` };
    saveThought(newThought);
  };

  return (
    <div>
      <button onClick={handleAddThought}>Add Thought</button>
      <div className="thoughts-feed">
        {thoughts.map((thought) => (
          <div key={thought.id} className="thought-item">
            {thought.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThoughtsFeed;