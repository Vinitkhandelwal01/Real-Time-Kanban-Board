import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import KanbanBoard from './components/KanbanBoard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NavBar from './components/NavBar';
import AddTaskPage from './pages/AddTaskPage';
import './App.css';
import { io } from 'socket.io-client';
import { api } from './services/api';

function AppRoutes() {
  const [allUsers, setAllUsers] = React.useState([]);

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [tasks, setTasks] = React.useState([]);
  const [activityLog, setActivityLog] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  // const users = ['Alice', 'Bob', 'Charlie'];
  const navigate = useNavigate();
  const loadUsers = async () => {
    try {
      const userList = await api.getUsers();
      setAllUsers(userList);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };
  
  const pushActivity = (user, action, desc) => {
    setActivityLog((prev) => [
      { id: Date.now() + Math.random(), user, action, desc, time: 'just now' },
      ...prev.slice(0, 19)
    ]);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await api.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const logs = await api.getActionLogs();
      setActivityLog(logs);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  const handleAddTask = async (form) => {
    try {
      setLoading(true);
      await api.createTask(form);
      
    const user = allUsers.find(u => u._id === form.assignedTo);
    const userName = user ? user.userName : form.assignedTo;

    pushActivity(userName, 'added', form.title);
    } catch (err) {
      setError('Failed to create task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle login/logout
  const handleLogin = (user) => {
    setIsLoggedIn(true);
    localStorage.setItem('userName', user.userName);
    loadTasks();
    loadActivityLogs();
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setTasks([]);
    setActivityLog([]);
    navigate('/login', { replace: true });
  };

  React.useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadTasks();
      loadActivityLogs();
      loadUsers();
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('taskUpdated', ({ type, task }) => {
      setTasks(prev => {
        if (type === 'create') {
          // Check if task already exists to prevent duplicates
          const exists = prev.find(t => t._id === task._id);
          if (exists) return prev;
          return [task, ...prev];
        }
        if (type === 'update') return prev.map(t => t._id === task._id ? task : t);
        if (type === 'delete') return prev.filter(t => t._id !== task._id);
        return prev;
      });
    });
    socket.on('actionLogged', (log) => {
      setActivityLog(prev => [log, ...prev.slice(0, 19)]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/board" replace />
          ) : (
            <LoginPage onSwitch={() => window.location.replace('/register')} onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isLoggedIn ? (
            <Navigate to="/board" replace />
          ) : (
            <RegisterPage onSwitch={() => window.location.replace('/login')} onRegister={handleLogin} />
          )
        }
      />
      <Route
        path="/add-task"
        element={
          isLoggedIn ? (
            <AddTaskPage
              allUsers={allUsers}
              existingTitles={tasks.map(t => t.title.toLowerCase())}
              onAddTask={handleAddTask}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/board"
        element={
          isLoggedIn ? (
            <>
              <NavBar onLogout={handleLogout} />
              {error && <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>{error}</div>}
              {loading && <div style={{ textAlign: 'center', padding: '10px' }}>Loading...</div>}
              <KanbanBoard
                tasks={tasks}
                setTasks={setTasks}
                // users={users}
                activityLog={activityLog}
                setActivityLog={setActivityLog}
                pushActivity={pushActivity}
                api={api}
              />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? "/board" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
