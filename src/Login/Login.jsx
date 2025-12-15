import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { strings } from '../string';

const Login = ({ setToken }) => {
  const [empCode, setEmpCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showPopup, setShowPopup] = useState(false);  // popup state
  const [popupMsg, setPopupMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `http://${strings.localhost}/api/auth/login?em_emp_code=${encodeURIComponent(empCode)}&em_password=${encodeURIComponent(password)}`
      );

      if (response.data && response.data.message === "Login Successful!") {

        localStorage.setItem('empCode', response.data.empCode);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('fullName', response.data.fullName);
        localStorage.setItem('companyId', response.data.companyId);
        localStorage.setItem('Role', response.data.hazopRoles);

        // Do NOT setToken here
        setPopupMsg(`Hey, welcome ${response.data.fullName}`);
        setShowPopup(true);



      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'An unexpected error occurred. Please try again later.'
      );
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setToken(true);
    navigate('/HazopPage');
  };


  return (
    <div className="logincontainer">

      {/* ===== Custom Popup Inside Login Component ===== */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>{popupMsg}</h3>
            <div className="floating-sparkle"></div>
            <div className="floating-sparkle"></div>
            <div className="floating-sparkle"></div>
            <div className="floating-sparkle"></div>
            <button className="popup-btn" onClick={handlePopupClose}>OK</button>
          </div>
        </div>
      )}

      <div className="form-container">
        <div className="login-container">
          <div className="logo">
            <img src="/assets/Pristine.png" alt="Pristine Logo" style={{ width: '90%' }} />
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              placeholder="Enter Employee Code"
              type="text"
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaClock className="input-icon" />
            <input
              placeholder="Enter Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {showPassword ? (
              <FaEyeSlash className="password-toggle-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <FaEye className="password-toggle-icon" onClick={() => setShowPassword(true)} />
            )}
          </div>

          <button type="submit" className="loginbutton">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
