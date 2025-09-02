const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDb = require('./src/config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// DB
connectDb();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/chats', require('./src/routes/chat.routes'));
app.use('/api/messages', require('./src/routes/message.routes'));

// Socket.IO
io.on('connection', (socket) => {
  socket.on('setup', (userId) => {
    socket.join(userId);
    socket.emit('connected');
  });

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('typing', (chatId) => socket.in(chatId).emit('typing'));
  socket.on('stop typing', (chatId) => socket.in(chatId).emit('stop typing'));

  socket.on('new message', (message) => {
    const { chat, sender, recipients } = message;
    if (Array.isArray(recipients)) {
      recipients.forEach((userId) => {
        if (userId !== sender) socket.in(userId).emit('message received', message);
      });
    }
    if (chat) socket.in(chat).emit('message received', message);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


