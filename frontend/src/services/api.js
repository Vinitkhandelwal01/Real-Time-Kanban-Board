const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const api = {
  // Task APIs
  async getAllTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task');
    }
    return response.json();
  },

  async updateTask(taskId, taskData) {
    console.log('Updating task:', taskId, 'with data:', taskData);
    console.log('API URL:', `${API_BASE_URL}/tasks/${taskId}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Update task error response:', error);
        if (response.status === 409) {
          // Conflict detected
          throw new Error('CONFLICT', { cause: error });
        }
        throw new Error(error.message || 'Failed to update task');
      }
      return response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  },

  async deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete task');
    }
    return response.json();
  },

  // Action Log APIs
  async getActionLogs() {
    const response = await fetch(`${API_BASE_URL}/actions`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch action logs');
    }
    return response.json();
  },

  async getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.warn('Unauthorized. Removing token and redirecting...');
      localStorage.removeItem('token');
      window.location.href = '/login';  // Optional: force redirect
    }

    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to fetch users');
  }

  return response.json();
}

}; 