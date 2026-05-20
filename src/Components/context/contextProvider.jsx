import React, { useState } from 'react';
const MyContext = React.createContext();

const ContextDataProvider = ({ children }) => {
  const [contextObj, setContextObj] = useState({});

  return (
    <MyContext.Provider value={{ contextObj, setContextObj }}>
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, ContextDataProvider };
