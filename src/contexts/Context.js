import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const useMyContext = () => useContext(MyContext);

export const Context = ({ children }) => {

  const [selectedDB, setSelectedDB] = useState(false);
  const [db, setDB] = useState('not selected');

  const handleSelectDB = (input) => {
    setDB(input);
    console.log("Selected db: ", db);
  };

  


  return (
    <MyContext.Provider value={{ db, setDB, selectedDB , handleSelectDB }}>
      {children}
    </MyContext.Provider>
  );
};