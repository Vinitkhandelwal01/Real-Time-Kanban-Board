import React, { useState } from 'react';
import './ConflictModal.css';

const fields = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' }
];

const ConflictModal = ({ isOpen, localTask, serverTask, onResolve, onCancel }) => {
  const [selected, setSelected] = useState(() => {
    // Default: prefer local for all fields
    const sel = {};
    fields.forEach(f => { sel[f.key] = 'local'; });
    return sel;
  });

  if (!isOpen) return null;

  const handleFieldSelect = (field, source) => {
    setSelected(prev => ({ ...prev, [field]: source }));
  };

  const handleResolve = () => {
    const mergedTask = { _id: serverTask._id, ...serverTask };

    fields.forEach(f => {
      mergedTask[f.key] = selected[f.key] === 'local' ? localTask[f.key] : serverTask[f.key];
    });
    mergedTask.version = (serverTask.version || 0) + 1;
    onResolve(mergedTask, 'merge');
  };

  const handleOverwrite = () => {
    const overwrittenTask = {
      ...localTask,
      version: (serverTask.version || 0) + 1
    };
    onResolve(overwrittenTask, 'overwrite');
  };

  return (
    <div className="conflict-modal-overlay">
      <div className="conflict-modal">
        <div className="conflict-modal-header">
          <h2>⚠️ Conflict Detected</h2>
          <p>Another user has modified this task while you were editing it.</p>
        </div>
        <div className="conflict-comparison field-merge">
          {fields.map(f => (
            <div className="conflict-field-row" key={f.key}>
              <div className="conflict-field-label">{f.label}:</div>
              <div className={`conflict-field-option ${selected[f.key] === 'local' ? 'selected' : ''}`}
                   onClick={() => handleFieldSelect(f.key, 'local')}>
                <input type="radio" checked={selected[f.key] === 'local'} readOnly />
                <span>Your version: <strong>{localTask[f.key]}</strong></span>
              </div>
              <div className={`conflict-field-option ${selected[f.key] === 'server' ? 'selected' : ''}`}
                   onClick={() => handleFieldSelect(f.key, 'server')}>
                <input type="radio" checked={selected[f.key] === 'server'} readOnly />
                <span>Server version: <strong>{serverTask[f.key]}</strong></span>
              </div>
            </div>
          ))}
        </div>
        <div className="conflict-actions">
          <button className="conflict-btn merge-btn" onClick={handleResolve}>
            🔄 Merge (Pick fields)
          </button>
          <button className="conflict-btn overwrite-btn" onClick={handleOverwrite}>
            💾 Overwrite (Use your version completely)
          </button>
          <button className="conflict-btn cancel-btn" onClick={onCancel}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal; 