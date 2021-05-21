import app from './app';
import logger from './logger';

const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

process.on('exit', () => {
  logger.info('Shutting down ...')
  let SerialMonitorsService = app.service('serial-monitors');
  if (SerialMonitorsService) {
    SerialMonitorsService.onExit()
  }
})

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);
