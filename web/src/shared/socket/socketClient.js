import { io } from 'socket.io-client';

import { API_BASE_URL } from '../api/baseApi.js';

let socket = null;

function getSocketBaseUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }

  return window.location.origin;
}

function getSocket() {
  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }

  return socket;
}

export {
  getSocket,
};
