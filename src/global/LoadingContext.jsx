import React, { createContext, useState, useContext } from 'react';

// Create the LoadingContext
const LoadingContext = createContext({
  loading: false,
  setLoading: () => { },
  message: '',
  setLoadingWithMessage: () => { }
});

// Create a provider component
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  // Function to set both loading state and message at once
  const setLoadingWithMessage = (isLoading, customMessage = 'Loading...') => {
    setLoading(isLoading);
    setMessage(customMessage);
  };

  // The value that will be available to consumers of this context
  const value = {
    loading,
    setLoading,
    message,
    setLoadingWithMessage
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Create a custom hook for easier context usage
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 