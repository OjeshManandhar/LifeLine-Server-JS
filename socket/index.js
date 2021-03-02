// packages
const socketIO = require('socket.io');

// eventHandler
const eventHandler = require('./eventHandler');

class Socket {
  #io = undefined;

  init(server) {
    this.#io = socketIO(server, {
      cors: {
        origin: '*'
      }
    });

    this.#io.on('connection', socket => eventHandler(socket, this.#io));
  }

  get io() {
    if (!this.#io) {
      throw new Error('Socket is not initialised yet');
    }

    return this.#io;
  }
}

module.exports = new Socket();
