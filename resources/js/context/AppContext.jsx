import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type) => {
    if (!msg) return;
    if (type === 'error') {
      toast.error(msg);
      return;
    }
    if (type === 'success') {
      toast.success(msg);
      return;
    }
    const lower = String(msg).toLowerCase();
    if (lower.includes('gagal') || lower.includes('failed') || lower.includes('error') || lower.includes('tidak ada')) {
      toast.error(msg);
    } else if (lower.includes('pilih file')) {
      toast.warning(msg);
    } else {
      toast.success(msg);
    }
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common['Authorization'];
    setActiveRole(null);
    setUser(null);
    setActivePage('dashboard');
    setSidebarOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeRole,
        setActiveRole,
        activePage,
        setActivePage,
        sidebarOpen,
        setSidebarOpen,
        showToast,
        loading,
        setLoading,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
