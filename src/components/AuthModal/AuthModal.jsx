import React, { useState } from 'react';
import LoginComponent from '../LoginComponent/LoginComponent';
import SignupComponent from '../SignupComponent/SignupComponent';

const AuthModal = ({ onClose, showtime, navigateAfterLogin }) => {
  const [currentForm, setCurrentForm] = useState('login');

  const handleClose = () => {
    setCurrentForm('login');
    onClose();
  };

  return (
    <>
      {currentForm === 'login' && (
        <LoginComponent
          onClose={handleClose}
          onSwitchToSignup={() => setCurrentForm('signup')}
          showtime={showtime}
          navigateAfterLogin={navigateAfterLogin}
        />
      )}
      {currentForm === 'signup' && (
        <SignupComponent
          onClose={handleClose}
          onSwitchToLogin={() => setCurrentForm('login')}
        />
      )}
    </>
  );
};

export default AuthModal;
