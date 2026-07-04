import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

let socket = null;

// Returns a connected socket authenticated with the current JWT.
// Reuses a single connection across the app rather than opening one per component.
export const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });
  } else {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
