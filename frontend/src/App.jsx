import "./App.css";
import React from 'react';
import Auth from './components/Auth';
import CreateEvent from './components/CreateEvent';

function App() {
  return (
    <>
      <div>
        <Auth />
        <CreateEvent />
      </div>
    </>
  );
}

export default App;
