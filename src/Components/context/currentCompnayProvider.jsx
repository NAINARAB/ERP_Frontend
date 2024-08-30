import React, { useState } from 'react';
const CurretntCompany = React.createContext();

const CompanyDataProvider = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState({
    id: '',
    CompName: '',
    CompanySettings: false,
  });

  return (
    <CurretntCompany.Provider value={{ currentCompany, setCurrentCompany }}>
      {children}
    </CurretntCompany.Provider>
  );
};

export { CurretntCompany, CompanyDataProvider };
