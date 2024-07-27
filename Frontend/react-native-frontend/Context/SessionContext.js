// SessionContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext();

const SessionProvider = ({ children }) => {
  const [sessionID, setSessionID] = useState(null);

  useEffect(() => {
    const loadSessionID = async () => {
      try {
        const storedSessionID = await AsyncStorage.getItem('sessionID');
        if (storedSessionID) {
          setSessionID(storedSessionID);
        }
      } catch (error) {
        console.error('Failed to load session ID', error);
      }
    };

    loadSessionID();
  }, []);

  const saveSessionID = async (id) => {
    try {
      await AsyncStorage.setItem('sessionID', id);
      setSessionID(id);
    } catch (error) {
      console.error('Failed to save session ID', error);
    }
  };

  return (
    <SessionContext.Provider value={{ sessionID, saveSessionID }}>
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionProvider };
