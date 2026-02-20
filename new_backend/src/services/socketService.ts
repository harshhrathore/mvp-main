import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

let io: SocketIOServer;

export const initSocketService = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5173',
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.id}`);

    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      console.log(`User ${socket.user.id} joined room user:${socket.user.id}`);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user?.id);
    });
  });

  console.log('Socket.IO initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const sendToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};
