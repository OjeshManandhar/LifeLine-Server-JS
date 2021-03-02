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
    return this.#io;
  }
}

module.exports = new Socket();
