import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, AlarmContext } from '../../declarations';
import SerialPort from "serialport";
import logger from '../../logger';

// @ts-ignore The types for serialport are incomplete
const InterByteTimeout = SerialPort.parsers.InterByteTimeout;

interface SerialMonitorsData {
  id: number
  port: string
  active: boolean
  timeout: number
}

export class SerialMonitors extends Service<SerialMonitorsData> {
  private app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app
  }

  setup (app: Application) {
    // Wait for the database, then start monitoring all serial ports marked as active
    (app.get('databaseReady') as Promise<void>)
      .then(() => this.find({ query: { active: true }, paginate: false }))
      .then((serialMonitors) => {
        if (!Array.isArray(serialMonitors)) {
          logger.error('Query for serial monitors did not return an Array')
          return
        }

        Promise.all(serialMonitors.map(serialMonitor => this.startMonitoring(serialMonitor)))
          .catch(reason => {
            logger.error('Could not start to monitor serial ports', reason)
          })
      }).catch(reason => {
      logger.error('Could not query serial ports to monitor', reason)
    })
  }

  private async startMonitoring(serialMonitor: SerialMonitorsData) {
    let port = new SerialPort(serialMonitor.port)
    let parser = port.pipe(new InterByteTimeout({ interval: serialMonitor.timeout }))
    parser.on('data', (data: any) => this.notifyListeners(data, serialMonitor))
    logger.info('Started monitoring %s', serialMonitor.port)
  }

  private async notifyListeners(alarmText: string, portToWatch: SerialMonitorsData) {
    logger.info('Recieved alarm: %s', alarmText)
    let context: AlarmContext = {pager_id: portToWatch.id, alarmText: alarmText, port: portToWatch.port};
    // @ts-ignore TypeScript does not know that this is an EventEmitter
    this.emit('pager_alarm', context)
  }
}
