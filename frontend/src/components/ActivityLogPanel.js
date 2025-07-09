import React from 'react';
import './ActivityLogPanel.css';
import { formatDistanceToNow } from 'date-fns';

const ActivityLogPanel = ({ actions = [] }) => {
  return (
    <aside className="activity-log-panel">
      <h3>Activity Log</h3>
      <div className="activity-log-list">
        {actions.length === 0 && <div className="activity-log-empty">No recent activity.</div>}
        {actions.map((a) => (
          <div className="activity-log-item" key={a._id || a.id}>
            <span className="activity-user">{a.user}</span>
            <span className="activity-action">{a.action}</span>
            <span className="activity-desc">{a.desc}</span>
            <span className="activity-time">
              {a.time && !isNaN(new Date(a.time).getTime())
                ? formatDistanceToNow(new Date(a.time), { addSuffix: true })
                : 'just now'}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ActivityLogPanel; 