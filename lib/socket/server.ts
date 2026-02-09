import { Server } from 'socket.io';

let io: Server | null = null;

export function startSocketServer(): Server {
  const port = Number(process.env.SOCKET_PORT) || 3000;

  io = new Server(port, {
    cors: { origin: '*' },
  });

  io.on('connection', socket => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log(`🔌 Socket.IO server listening on port ${port}`);
  return io;
}

export function getIO(): Server | null {
  return io;
}
