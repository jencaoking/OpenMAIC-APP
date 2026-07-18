import React from 'react';
import RootLayout from './_layout';
import HomePage from './index';

const App: React.FC = () => {
  return (
    <RootLayout>
      <HomePage />
    </RootLayout>
  );
};

export default App;