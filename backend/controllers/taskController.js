const Task = require('../models/Task');
const ActionLog = require('../models/ActionLog');
const COLUMN_NAMES = ['todo', 'in progress', 'done'];
const User = require('../models/User');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority } = req.body;
    if (!title || !description || !assignedTo) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (COLUMN_NAMES.includes(title.trim().toLowerCase())) {
      return res.status(400).json({ message: 'Task title must not match column names.' });
    }
    const exists = await Task.findOne({ title: title.trim() });
    if (exists) {
      return res.status(400).json({ message: 'Task title must be unique.' });
    }
    const task = await Task.create({ title, description, assignedTo, status, priority });
    req.app.get('io').emit('taskUpdated', { type: 'create', task });
    // Log action
    if (req.user && req.user.username) {
      await ActionLog.create({ user: req.user.username, action: 'added', target: 'task', desc: `${title}` });
    }
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    console.log('Update task request:', { params: req.params, body: req.body, user: req.user });
    const { title, description, assignedTo, status, priority, version } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    if (title && COLUMN_NAMES.includes(title.trim().toLowerCase())) {
      return res.status(400).json({ message: 'Task title must not match column names.' });
    }
    if (title && title !== task.title) {
      const exists = await Task.findOne({ title: title.trim() });
      if (exists) {
        return res.status(400).json({ message: 'Task title must be unique.' });
      }
    }
    if (version && version !== task.version) {
      return res.status(409).json({ message: 'CONFLICT', serverTask: task });
    }
    const oldAssignedTo = task.assignedTo;
    const oldStatus = task.status;
    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.version += 1;
    await task.save();
    req.app.get('io').emit('taskUpdated', { type: 'update', task });
    // Log action
    let action = 'edited';
    let desc = `${task.title}`;
    if (assignedTo && assignedTo !== oldAssignedTo) {
      action = 'assigned';
      const assignedUser = await User.findById(assignedTo);
      const assignedName = assignedUser?.userName || assignedTo;
      desc = `${task.title} to ${assignedName}`; 
    }else if (status && status !== oldStatus) {
      action = 'moved';
      desc = `${task.title} to ${status}`;
    }
    if (req.user && req.user.username) {
      await ActionLog.create({ user: req.user.username, action, target: 'task', desc });
    }
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    req.app.get('io').emit('taskUpdated', { type: 'delete', task });
    // Log action
    if (req.user && req.user.username) {
      await ActionLog.create({ user: req.user.username, action: 'deleted', target: 'task', desc: `${task.title}` });
    }
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
}; 