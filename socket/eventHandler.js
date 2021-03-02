const strings = {
  operations: {
    create: 'create',
    delete: 'delete',
    update: 'update'
  },
  events: {
    driver_gps: 'driver_gps',
    traffic_gps: 'traffic_gps',
    obstructions: 'obstruction',
    driver_routes: 'driver_route'
  }
};

const socketData = {
  driver_gps: [],
  traffic_gps: [],
  obstructions: [],
  driver_routes: []
};

function eventHandler(socket, io) {
  // send initial data
  socket.send(socketData);

  // send initial data to request
  socket.on('message', (undefined, callback) => callback(socketData));

  socket.on(strings.events.driver_gps, data => {
    const op = data.operation;
    const gps = data.driver_gps;

    if (op === strings.operations.create) {
      socketData.driver_gps.push(gps);
    } else if (op === strings.operations.update) {
      socketData.driver_gps = socketData.driver_gps.filter(
        data => data.properties.contact !== gps.properties.contact
      );

      socketData.driver_gps.push(gps);
    } else if (op === strings.operations.delete) {
      socketData.driver_gps = socketData.driver_gps.filter(
        data => data.properties.contact !== gps.properties.contact
      );
    }

    socket.broadcast.emit(strings.events.driver_gps, socketData.driver_gps);
  });

  socket.on(strings.events.traffic_gps, data => {
    const op = data.operation;
    const gps = data.traffic_gps;

    if (op === strings.operations.create) {
      socketData.traffic_gps.push(gps);
    } else if (op === strings.operations.update) {
      socketData.traffic_gps = socketData.traffic_gps.filter(
        data => data.properties.contact !== gps.properties.contact
      );

      socketData.traffic_gps.push(gps);
    } else if (op === strings.operations.delete) {
      socketData.traffic_gps = socketData.traffic_gps.filter(
        data => data.properties.contact !== gps.properties.contact
      );
    }

    socket.broadcast.emit(strings.events.traffic_gps, socketData.traffic_gps);
  });

  socket.on(strings.events.obstructions, data => {
    const op = data.operation;
    const obs = data.obstruction;

    if (op === strings.operations.create) {
      socketData.obstructions.push(obs);
    } else if (op === strings.operations.update) {
      socketData.obstructions = socketData.obstructions.filter(
        data =>
          data.properties.id !== obs.properties.id ||
          data.properties.contact !== obs.properties.contact
      );

      socketData.obstructions.push(obs);
    } else if (op === strings.operations.delete) {
      socketData.obstructions = socketData.obstructions.filter(
        data =>
          data.properties.id !== obs.properties.id ||
          data.properties.contact !== obs.properties.contact
      );
    }

    io.emit(strings.events.obstructions, socketData.obstructions);
  });

  socket.on(strings.events.driver_routes, data => {
    const op = data.operation;
    const route = data.driver_route;

    if (op === strings.operations.create) {
      socketData.driver_routes.push(route);
    } else if (op === strings.operations.update) {
      socketData.driver_routes = socketData.driver_routes.filter(
        data => data.properties.contact !== route.properties.contact
      );

      socketData.driver_routes.push(route);
    } else if (op === strings.operations.delete) {
      socketData.driver_routes = socketData.driver_routes.filter(
        data => data.properties.contact !== route.properties.contact
      );
    }

    socket.broadcast.emit(
      strings.events.driver_routes,
      socketData.driver_routes
    );
  });
}

module.exports = eventHandler;
