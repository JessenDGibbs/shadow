import React, { useState, useEffect } from 'react';
import Modal from './SourcesModal'; // Assuming you have a Modal component
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import './CalendarModal.css';
import Tooltip from './Tooltip'; // Import the Tooltip component
import { getCalContent } from '../api';
import { RefreshCcw, Activity } from 'react-feather';




function CalendarModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState([]); // Initialize items as an empty array
    const [isFetching, setIsFetching] = useState(false);


    // Standalone function for fetching items
    const fetchItems = async () => {
        setIsFetching(true); // Start fetching
        const maxRetries = 3;
        let attempts = 0;

        const attemptFetch = async () => {
            try {
                const response = await fetch('https://7c00-2605-8d80-1120-814-fdb6-19f7-c2e0-1c74.ngrok-free.app/calendarContent');
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                const data = await response.json();
                setItems(data); // Adjust based on your data structure
            } catch (error) {
                console.error("Attempt to fetch items failed:", error);
                if (attempts < maxRetries) {
                    attempts += 1;
                    console.log(`Retrying... Attempt ${attempts}`);
                    attemptFetch(); // Retry fetching
                } else {
                    console.error("Max retries reached. Failed to fetch items.");
                }
            } finally {
                setIsFetching(false); // Stop fetching regardless of success or failure
            }
        };

        attemptFetch();
    };

    // useEffect to load data when the component mounts
    // React.useEffect(() => {
    //     fetchItems();
    // }, []); 
  
    // const items = [
    //   { id: 1, title: 'Note', date: '2024-02-27', meta: "Playing with a calendar view of exploring content creation and actions" },
    //   { id: 2, title: 'Notion', date: '2024-02-27', meta: "Playing with a calendar view of exploring content creation and actions" },
    // ];
  
    const findItemsForDate = (date) => {
        return items.filter(item => {
            // Extract the year, month, and day from item.date assuming it's in 'YYYY-MM-DD' format
            const [year, month, day] = item.date.split('-').map(num => parseInt(num, 10));
            // Construct a new Date object using the local time zone
            // Note: JavaScript months are 0-indexed, so subtract 1 from the month
            const itemDate = new Date(year, month - 1, day);
            // Compare dates without considering time
            return itemDate.toDateString() === date.toDateString();
          });
    };
  
    const renderTileContent = ({ date, view }) => {
        if (view === 'month') {
          const itemsForDate = findItemsForDate(date);
          return (
            <div className="calendar-tile-content">
              {itemsForDate.map(item => (
                <div key={item.id} className="calendar-item-card">
                  {item.title}
                  <Tooltip content={item.meta} />
                </div>
              ))}
            </div>
          );
        }
      };
    
      return (
        <div className='calendar-modal-container'>
          <button className="open-modal-button" onClick={() => setIsModalOpen(true)}><Activity size={20}/></button>
          {isModalOpen && (
            <Modal onClose={() => setIsModalOpen(false)} title="Calendar" developerText={false}>
              <div className="header-container">
                    <button class="open-modal-button" onClick={fetchItems}>
                        <RefreshCcw className={isFetching ? "spin-animation" : ""} size={20}/>
                    </button>
                    <h3>Activity Calendar</h3>
                </div>
              <Calendar tileContent={renderTileContent} />
            </Modal>
          )}
        </div>
      );
    }
    
    export default CalendarModal;