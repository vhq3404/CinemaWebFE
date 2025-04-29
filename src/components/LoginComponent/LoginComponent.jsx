// File: LoginComponent.jsx
import React, { useState } from 'react';
import './LoginComponent.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { login } from '../../redux/actions';

const LoginComponent = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      setTimeout(async () => {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Đăng nhập thất bại');
        setIsLoading(false);
        return;
      }

      console.log('Token:', data.token);
      console.log('User:', data.user);

      dispatch(login(data.user, data.token));

      onClose(); 
    }, 1200);
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      setErrorMessage('Lỗi kết nối đến server'); 
      setIsLoading(false);
    }
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
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
