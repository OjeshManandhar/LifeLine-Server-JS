const strings = {
  operations: {
    create: 'create',
    update: 'update',
    delete: 'delete'
  },
  events: {
    driverGps: 'driver_gps',
    trafficGps: 'traffic_gps',
    obstructions: 'obstruction',
    driverRoutes: 'driver_route'
  }
};

const socketData = {
  driverGps: [],
  trafficGps: [],
  obstructions: [],
  driverRoutes: []
};

function eventHandler(socket) {
  socket.send(socketData);

  socket.on(strings.events.driverGps, data => {
    const op = data.operation;
    const gps = data.driver_gps;

    if (op === strings.operations.create) {
      socketData.driverGps.push(gsp);
    } else if (op === strings.operations.update) {
      socketData.driverGps = socketData.driverGps.filter(
        data => data.properties.contact !== gps.properties.contact
      );

      socketData.driverGps.push(gps);
    } else if (op === strings.operations.delete) {
      socketData.driverGps = socketData.driverGps.filter(
        data => data.properties.contact !== gps.properties.contact
      );
    }

    socket.broadcast.emit(strings.events.driverGps, socketData.driverGps);
  });

  socket.on(strings.events.trafficGps, data => {
    const op = data.operation;
    const gps = data.traffic_gps;

    if (op === strings.operations.create) {
      socketData.trafficGps.push(gsp);
    } else if (op === strings.operations.update) {
      socketData.trafficGps = socketData.trafficGps.filter(
        data => data.properties.contact !== gps.properties.contact
      );

      socketData.trafficGps.push(gps);
    } else if (op === strings.operations.delete) {
      socketData.trafficGps = socketData.trafficGps.filter(
        data => data.properties.contact !== gps.properties.contact
      );
    }

    socket.broadcast.emit(strings.events.trafficGps, socketData.trafficGps);
  });

  socket.on(strings.events.obstructions, data => {
    const op = data.operation;
    const obs = data.obstruction;

    if (op === strings.events.create) {
      socketData.obstructions.push(obs);
    } else if (op === strings.operations.update) {
      socketData.obstructions = socketData.obstructions.filter(
        data =>
          data.properties.id !== obs.properties.id ||
          data.properties.contact !== obs.properties.contact
      );

      socketData.obstructionspush(obs);
    } else if (op === strings.operations.delete) {
      socketData.obstructions = socketData.obstructions.filter(
        data =>
          data.properties.id !== obs.properties.id ||
          data.properties.contact !== obs.properties.contact
      );
    }

    socket.emit(strings.events.obstructions, socketData.obstructions);
  });

  socket.on(strings.events.driverRoutes, data => {
    const op = data.operation;
    const route = data.driver_route;

    if (op === strings.operations.create) {
      socketData.driverRoutes.push(route);
    } else if (op === strings.operations.update) {
      socketData.driverRoutes = socketData.driverRoutes.filter(
        data => data.properties.contact !== route.properties.contact
      );

      socketData.driverRoutes.push(route);
    } else if (op === strings.operations.delete) {
      socketData.driverRoutes = socketData.driverRoutes.filter(
        data => data.properties.contact !== route.properties.contact
      );
    }

    socket.broadcast.emit(strings.events.driverRoutes, socketData.driverRoutes);
  });
}

module.exports = eventHandler;
