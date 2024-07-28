import React from 'react';
import MainStackNavigator from './navigation/MainStackNavigator';
import { SessionProvider } from './Context/SessionContext';

export default function App() {
  return (
    <SessionProvider>
      <MainStackNavigator />
    </SessionProvider>
  );
}
