class SocketGateway {
  constructor() {
    this.io = null;
  }

  init(io) {
    this.io = io;

    this.io.on('connection', (socket) => {
      socket.on('join-match', (matchId) => this.joinMatch(socket, matchId));
      socket.on('match:join', (matchId) => this.joinMatch(socket, matchId));
      socket.on('leave-match', (matchId) => this.leaveMatch(socket, matchId));
      socket.on('match:leave', (matchId) => this.leaveMatch(socket, matchId));
    });

    return this.io;
  }

  roomName(matchId) {
    return `match:${matchId}`;
  }

  joinMatch(socket, matchId) {
    if (!matchId) return;
    socket.join(this.roomName(matchId));
  }

  leaveMatch(socket, matchId) {
    if (!matchId) return;
    socket.leave(this.roomName(matchId));
  }

  emitToMatch(matchId, event, payload) {
    if (!this.io || !matchId || !event) return false;
    this.io.to(this.roomName(matchId)).emit(event, payload);
    return true;
  }

  emitPublic(event, payload) {
    if (!this.io || !event) return false;
    this.io.emit(event, payload);
    return true;
  }
}

const socketGateway = new SocketGateway();

const initSocket = socketGateway.init.bind(socketGateway);
const emitToMatch = socketGateway.emitToMatch.bind(socketGateway);
const emitPublic = socketGateway.emitPublic.bind(socketGateway);

export { emitPublic, emitToMatch, initSocket, SocketGateway };
export default socketGateway;
