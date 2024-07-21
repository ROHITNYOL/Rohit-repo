
import React from 'react';
import axios from 'axios';

const Auth = () => {
  const handleAuth = () => {
    window.location.href = `${import.meta.env.VITE_Backend_URL}/auth`;
  };

  return (
    <div>
      <button onClick={handleAuth}>Authenticate with Google</button>
    </div>
  );
};

export default Auth;
