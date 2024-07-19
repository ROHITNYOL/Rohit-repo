
import React from 'react';
import axios from 'axios';

const Auth = () => {
  const handleAuth = () => {
    window.location.href = 'http://localhost:5000/auth';
  };

  return (
    <div>
      <button onClick={handleAuth}>Authenticate with Google</button>
    </div>
  );
};

export default Auth;
