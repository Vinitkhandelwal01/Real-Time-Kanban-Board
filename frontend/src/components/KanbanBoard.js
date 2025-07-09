import React from 'react';
import './KanbanBoard.css';
import TaskCard from './TaskCard';
import ActivityLogPanel from './ActivityLogPanel';
import ConflictModal from './ConflictModal';

const columns = [
  { key: 'todo', title: 'Todo' },
  { key: 'inprogress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
];

// Removed unused variables

const KanbanBoard = ({ tasks, setTasks, users: _users, activityLog, setActivityLog, pushActivity, api }) => {
  const [draggedTaskId, setDraggedTaskId] = React.useState(null);
  const [dragOverColumn, setDragOverColumn] = React.useState(null);
  const [conflictModal, setConflictModal] = React.useState({
    isOpen: false,
    localTask: null,
    serverTask: null,
    taskId: null,
    action: null
  });
  const [users, setUsers] = React.useState([]);
  const [allUsers, setAllUsers] = React.useState([]);

  React.useEffect(() => {
  async function fetchUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No auth token found. Skipping fetchUsers.");
      return;
    }

    try {
      const userList = await api.getUsers();
      console.log("Fetched users:", userList);
      setUsers(userList.map(u => u._id));
      setAllUsers(userList);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }

  fetchUsers();
}, [api]);


  const onDeleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId || t.id === taskId);
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => (t._id !== taskId && t.id !== taskId)));
      const userName = allUsers.find(u => u._id === task.assignedTo)?.userName || task.assignedTo;
      pushActivity(userName, 'deleted', `${task.title}`);
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task: ' + err.message);
    }
  };

  const onAssignTask = async (taskId, user) => {
    try {
      const task = tasks.find(t => t._id === taskId || t.id === taskId);
      const updatedTask = await api.updateTask(taskId, {
        assignedTo: user,
        version: task.version 
      });

      setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? updatedTask : t));

      const userObj = allUsers.find(u => u._id === user);
      const userName = userObj && userObj.userName ? userObj.userName : 'Unknown User';

      if (task) pushActivity(localStorage.getItem('userName') || 'Unknown', 'assigned', `${task.title} to ${userName}`);
    } catch (err) {
      if (err.message === 'CONFLICT') {
        const currentTask = tasks.find(t => t._id === taskId || t.id === taskId);
        const localTask = { ...currentTask, assignedTo: user };
        setConflictModal({
          isOpen: true,
          localTask,
          serverTask: err.cause.serverTask,
          taskId,
          action: 'assign'
        });
      } else {
        console.error('Failed to assign task:', err);
        alert('Failed to assign task: ' + err.message);
      }
    }
  };

  const onSmartAssign = async (taskId) => {
  console.log('Smart Assign Clicked', taskId);
  const task = tasks.find(t => t._id === taskId || t.id === taskId);
  if (!task) return;

  const counts = users.reduce((acc, u) => ({ ...acc, [u]: 0 }), {});
  tasks.forEach(t => {
    if (t.status === 'todo' || t.status === 'inprogress') counts[t.assignedTo]++;
  });

  let minUser = users[0];
  users.forEach(u => {
    if (counts[u] < counts[minUser]) minUser = u;
  });

  try {
    const updatedTask = await api.updateTask(taskId, {
      assignedTo: minUser,
      version: task.version 
    });

    setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? updatedTask : t));
    const userObj = allUsers.find(u => u._id === minUser);
    const userName = userObj && userObj.userName ? userObj.userName : 'Unknown User';
    pushActivity(localStorage.getItem('userName') || 'Unknown', 'smart assigned', `${task.title} to ${userName}`);
  } catch (err) {
    if (err.message === 'CONFLICT') {
      const localTask = { ...task, assignedTo: minUser };
      setConflictModal({
        isOpen: true,
        localTask,
        serverTask: err.cause.serverTask,
        taskId,
        action: 'smartAssign'
      });
    } else {
      console.error('Failed to smart assign task:', err);
      alert('Failed to smart assign task: ' + err.message);
    }
  }
};


  const onDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
  };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      try {
        const movedTask = tasks.find((t) => t._id === draggedTaskId || t.id === draggedTaskId);
        if (movedTask && movedTask.status !== newStatus) {
          const updatedTask = await api.updateTask(draggedTaskId, {
            status: newStatus,
            version: movedTask.version 
          });

          setTasks((prev) =>
            prev.map((task) =>
              (task._id === draggedTaskId || task.id === draggedTaskId) ? updatedTask : task
            )
          );
          const userName = allUsers.find(u => u._id === movedTask.assignedTo)?.userName || movedTask.assignedTo;
          pushActivity(localStorage.getItem('userName') || 'Unknown', 'moved', `${movedTask.title} to ${columns.find(c => c.key === newStatus).title}`);
        }
      } catch (err) {
        if (err.message === 'CONFLICT') {
          const currentTask = tasks.find((t) => t._id === draggedTaskId || t.id === draggedTaskId);
          const localTask = { ...currentTask, status: newStatus };
          setConflictModal({
            isOpen: true,
            localTask,
            serverTask: err.cause.serverTask,
            taskId: draggedTaskId,
            action: 'drop'
          });
        } else {
          console.error('Failed to update task status:', err);
          alert('Failed to update task status: ' + err.message);
        }
      }
    }
    setDraggedTaskId(null);
  };

  const onDragOver = (e, columnKey) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
  };

  const onDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleConflictResolve = async (resolvedTask, resolutionType) => {
    try {
      const updatedTask = await api.updateTask(conflictModal.taskId, resolvedTask);
      setTasks(prev => prev.map(t => (t._id === conflictModal.taskId || t.id === conflictModal.taskId) ? updatedTask : t));
      
      // Log the action based on the original action type
      const task = tasks.find(t => t._id === conflictModal.taskId || t.id === conflictModal.taskId);
      if (task) {
        if (conflictModal.action === 'assign') {
          const userObj = allUsers.find(u => u._id === resolvedTask.assignedTo);
          const userName = userObj && userObj.userName ? userObj.userName : 'Unknown User';
          pushActivity(localStorage.getItem('userName') || 'Unknown', 'assigned', `${task.title} to ${userName}`);
        } else if (conflictModal.action === 'smartAssign') {
          const userObj = allUsers.find(u => u._id === resolvedTask.assignedTo);
          const userName = userObj && userObj.userName ? userObj.userName : 'Unknown User';
          pushActivity(localStorage.getItem('userName') || 'Unknown', 'smart assigned', `${task.title} to ${userName}`);
        } else if (conflictModal.action === 'drop') {
          const userObj = allUsers.find(u => u._id === task.assignedTo);
          const userName = userObj && userObj.userName ? userObj.userName : 'Unknown User';
          pushActivity(localStorage.getItem('userName') || 'Unknown', 'moved', `${task.title} to ${resolvedTask.status}`);
        }
      }
      
      setConflictModal({ isOpen: false, localTask: null, serverTask: null, taskId: null, action: null });
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
      alert('Failed to resolve conflict: ' + err.message);
    }
  };

  const handleConflictCancel = () => {
    setConflictModal({ isOpen: false, localTask: null, serverTask: null, taskId: null, action: null });
  };

  return (
    <div className="kanban-board-layout">
      <div className="kanban-board">
        {columns.map((col) => (
          <div
            className={`kanban-column ${dragOverColumn === col.key ? 'drag-over' : ''}`}
            key={col.key}
            onDragOver={(e) => onDragOver(e, col.key)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <h2>{col.title}</h2>
            <div className="kanban-tasks">
              {tasks.filter((t) => t.status === col.key).length === 0 && (
                <div className="kanban-task placeholder">No tasks</div>
              )}
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    draggable
                    onDragStart={(e) => onDragStart(e, task._id || task.id)}
                    onDragEnd={onDragEnd}
                    className={draggedTaskId === (task._id || task.id) ? 'dragging' : ''}
                    onDelete={onDeleteTask}
                    onAssign={onAssignTask}
                    onSmartAssign={onSmartAssign}
                    users={users}
                    allUsers={allUsers}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <ActivityLogPanel actions={activityLog} />
      
      <ConflictModal
        isOpen={conflictModal.isOpen}
        localTask={conflictModal.localTask}
        serverTask={conflictModal.serverTask}
        onResolve={handleConflictResolve}
        onCancel={handleConflictCancel}
      />
    </div>
  );
};

export default KanbanBoard; 