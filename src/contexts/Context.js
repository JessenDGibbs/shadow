import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const useMyContext = () => useContext(MyContext);

export const ContextProvider = ({ children }) => {
  const [selectedDB, setSelectedDB] = useState(false);
  const [db, setDB] = useState('not selected');
  const [user, setUser] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false); 
  const [graphView, setGraphView] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [graphFilter, setGraphFilter] = useState(null);



  const handleSelectDB = (input) => {
    setDB(input);
    console.log("Selected db: ", db);
  };

  const manageGraphFilter = (filter) => {
    setGraphFilter(filter);
    console.log("Selected db: ", db);
  };


  const updateUser = (username) => {
    setUser(username); 
  };


  const updateFileUploaded = () => {
    setFileUploaded(true); 
  
    setTimeout(() => {
      setFileUploaded(false); 
    }, 5000);
  };

  const toggleInternetView = () => {
    setGraphView(!graphView); 

  };


  return (
    <MyContext.Provider value={{ db, setDB, selectedDB, handleSelectDB, user, updateUser, fileUploaded, updateFileUploaded, graphView, toggleInternetView, graphData, setGraphData, graphFilter, manageGraphFilter }}>
      {children}
    </MyContext.Provider>
  );
};