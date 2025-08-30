import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    // If no saved preference, check system preference
    if (savedTheme === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedTheme === 'true';
  });

  // Update localStorage and document class when darkMode changes
  useEffect(() => {
    console.log('Dark mode changed:', darkMode);
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      console.log('Adding dark class to html element');
      document.documentElement.classList.add('dark');
    } else {
      console.log('Removing dark class from html element');
      document.documentElement.classList.remove('dark');
    }
    console.log('Current html classes:', document.documentElement.className);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
