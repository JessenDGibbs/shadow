import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const useMyContext = () => useContext(MyContext);

export const ContextProvider = ({ children }) => {
  const [selectedDB, setSelectedDB] = useState(false);
  const [db, setDB] = useState('not selected');
  const [user, setUser] = useState(null); // Initialize user as null
  const [fileUploaded, setFileUploaded] = useState(false); // Initialize fileUploaded as false

  const handleSelectDB = (input) => {
    setDB(input);
    console.log("Selected db: ", db);
  };

  const updateUser = (username) => {
    setUser(username); // Function to update the user state
  };

  const updateFileUploaded = () => {
    setFileUploaded(true); // Assume a file has been uploaded and set to true
  
    setTimeout(() => {
      setFileUploaded(false); // Automatically revert to false after 5 seconds
    }, 5000); // 5000 milliseconds = 5 seconds
  };

  return (
    <MyContext.Provider value={{ db, setDB, selectedDB, handleSelectDB, user, updateUser, fileUploaded, updateFileUploaded }}>
      {children}
    </MyContext.Provider>
  );
};