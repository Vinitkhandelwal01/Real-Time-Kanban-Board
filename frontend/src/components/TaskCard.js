import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, draggable, onDragStart, onDragEnd, className = '', onDelete, onAssign, onSmartAssign, users = [], allUsers = [] }) => {
  // Find the assigned users name
  const assignedUser = allUsers.find(u => u._id === task.assignedTo);
  const getUserName = (userId) => {
    const user = allUsers.find(u => u._id === userId);
    return user ? user.userName : 'Unassigned';
  };
  
  return (
    <div
      className={`task-card ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-task-id={task._id || task.id}
    >
      <div className="task-title">{task.title}</div>
      <div className="task-desc">{task.description}</div>
      <div className="task-meta">
        <span className="task-user">
        <p><strong>Assigned to:</strong> {getUserName(task.assignedTo)}</p>

        </span>
        <span className={`task-priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      <div className="task-actions">
        <select
          value={task.assignedTo || ''}
          onChange={e => onAssign && onAssign(task._id || task.id, e.target.value)}
        >
          <option value="">Unassigned</option>
          {allUsers.map(user => (
            <option key={user._id} value={user._id}>{user.userName}</option>
          ))}
        </select>
        <button type="button" className="smart-assign-btn" onClick={() => onSmartAssign && onSmartAssign(task._id || task.id)}>
          Smart Assign
        </button>
        <button type="button" className="delete-btn" onClick={() => onDelete && onDelete(task._id || task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard; 