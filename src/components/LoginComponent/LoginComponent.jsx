// File: LoginComponent.jsx
import React, { useState } from 'react';
import './LoginComponent.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";

const LoginComponent = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="login-overlay">
      <div className="login-form">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label >
            <MdOutlineEmail/>
            Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
          <label>
          <MdLockOutline/>
          Mật khẩu:
          </label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ paddingRight: '40px' }}
        />
        <span
          onClick={togglePassword}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#888',
          }}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>
      </div>
     
          <button 
          type="submit"
          className="login-button"
          >
            Đăng nhập
            </button>
          <button
          type="button"
          className="forgot-password-btn"
          onClick={() => console.log('Forgot Password')}
          >
            Quên mật khẩu?
            </button>

            <div className="login-divider"></div>
            <div className="register-suggestion">Bạn chưa có tài khoản?</div>
            <button
            type="button"
            className="signup-button"
            onClick={onSwitchToSignup}
            >
            Đăng ký
            </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
