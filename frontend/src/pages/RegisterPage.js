import React, { useState } from 'react';
import './AuthForm.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const EyeIcon = ({ open }) => open ? <FiEye size={20} /> : <FiEyeOff size={20} />;

const RegisterPage = ({ onSwitch, onRegister }) => {
  const [form, setForm] = useState({ userName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.userName || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: form.userName, email: form.email, password: form.password, confirmPassword:form.confirmPassword})
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }
      localStorage.setItem('token', data.token);
      if (onRegister) onRegister(data.user);
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Username
          <input
            type="text"
            name="userName"
            value={form.userName}
            onChange={handleChange}
            autoComplete="userName"
          />
        </label>
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
              autoComplete="new-password"
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
        <label className="password-label">
          Confirm Password
          <div className="password-input-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </label>
        <button type="submit" className="auth-btn">Register</button>
        <div className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch}>Login</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage; 