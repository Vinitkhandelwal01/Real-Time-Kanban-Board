import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <strong>📝 Real-Time To-Do Board</strong>
      </div>
      <div className="navbar-actions">
        <Link to="/add-task" className="add-task-btn">Add Task</Link>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 