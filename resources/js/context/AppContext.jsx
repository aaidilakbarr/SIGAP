import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth & Navigation
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // UI State
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common['Authorization'];
    setActiveRole(null);
    setUser(null);
    setActivePage('dashboard');
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      activeRole, setActiveRole,
      activePage, setActivePage,
      sidebarOpen, setSidebarOpen,
      toastMsg, setToastMsg, showToast,
      loading, setLoading,
      handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
