import React, { useState } from 'react';
import './AuthForm.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EyeIcon = ({ open }) => open ? <FiEye size={20} /> : <FiEyeOff size={20} />;

const LoginPage = ({ onSwitch, onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed.');
        return;
      }
      localStorage.setItem('token', data.token);
      if (onLogin) onLogin(data.user);
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </label>
        <label className="password-label">
          Password
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </label>
        <button type="submit" className="auth-btn">Login</button>
        <div className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitch}>Register</button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 