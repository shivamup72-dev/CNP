import React, { createContext, useState, useContext } from 'react';

// Create the context
const ViewContext = createContext();

// Create a provider component
export const ViewProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('posts'); // 'posts' or 'voterCards'

  // The value that will be provided to consumers of this context
  const value = {
    currentView,
    setCurrentView,
    showPosts: () => setCurrentView('posts'),
    showVoterCards: () => setCurrentView('voterCards'),
  };

  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  );
};

// Custom hook to use the context
export const useView = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};

export default ViewContext; 