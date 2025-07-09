import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTaskPage.css';
import { ImCross } from "react-icons/im";

const priorities = ['High', 'Medium', 'Low'];
const statuses = [
  { key: 'todo', label: 'Todo' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const AddTaskPage = ({ allUsers = [], existingTitles = [], onAddTask }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'todo',
    assignedTo: allUsers[0]?._id || '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (existingTitles.includes(form.title.trim().toLowerCase())) {
      setError('Task title must be unique.');
      return;
    }
    if (statuses.some(s => s.label.toLowerCase() === form.title.trim().toLowerCase())) {
      setError('Task title must not match column names.');
      return;
    }
    onAddTask(form);
    navigate('/board');
  };

  return (
    <div className="add-task-page">
      <div className="add-task-card">
        <button
          type="button"
          aria-label="Close"
          className="add-task-close-btn"
          onClick={() => navigate('/board')}
        >
          <ImCross />
        </button>
        <form className="add-task-form" onSubmit={handleSubmit}>
          <h2 className="add-task-title">Add Task</h2>
          {error && <div className="add-task-error">{error}</div>}
          <label>
            Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              autoComplete="off"
              className="add-task-input"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="add-task-textarea"
            />
          </label>
          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleChange} className="add-task-select">
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange} className="add-task-select">
              {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
          <label>
            Assigned User
            <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="add-task-select">
              {allUsers.map(user => (
                <option key={user._id} value={user._id}>{user.userName}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="add-task-btn-main">Add Task</button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskPage; 