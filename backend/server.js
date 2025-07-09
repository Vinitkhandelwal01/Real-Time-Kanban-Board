const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const allowedOrigins = [
  'http://localhost:3000',
  'https://real-time-kanban-board-two.vercel.app' 
];

// Apply CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = new Server(http, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});


// app.use(cors());
app.use(express.json());

app.set('io', io); 

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
})
  .then(() => {
    console.log('MongoDB connected');
    http.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Also mount /api/users to the same router for GET /api/users
app.use('/api/users', authRoutes);

const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

const actionRoutes = require('./routes/actions');
app.use('/api/actions', actionRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
}); 