import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, AlarmContext } from '../../declarations';
import SerialPort from "serialport";
import logger from '../../logger';
import { Params, NullableId } from '@feathersjs/feathers';

// @ts-ignore The types for serialport are incomplete
const InterByteTimeout = SerialPort.parsers.InterByteTimeout;

interface SerialMonitorsData {
  id: number
  port: string
  baudRate: number
  active: boolean
  timeout: number
}

export class SerialMonitors extends Service<SerialMonitorsData> {
  private app: Application
  private monitors: Map<Number, SerialPort>

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app
    this.monitors = new Map<Number, SerialPort>()
  }

  setup (app: Application) {
    // Wait for the database, then start monitoring all serial ports marked as active
    (app.get('databaseReady') as Promise<void>)
      .then(() => this.find({ query: { active: true }, paginate: false }) as Promise<SerialMonitorsData[]>)
      .then(serialMonitors => this.bulkStartMonitoring(serialMonitors))
      .catch(reason => {
        logger.error('Could not query serial ports to monitor: ', reason.message)
      })
  }

  private async bulkStartMonitoring(serialMonitors: SerialMonitorsData[]) {
    let serialMonitorPromises = serialMonitors.map(serialMonitor => this.startMonitoring(serialMonitor));
    // @ts-ignore Function allSettled() seems to be unknown
    let results = await Promise.allSettled(serialMonitorPromises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        logger.info('Started monitoring %s', result.value.port)
      } else {
        logger.error('Could not start monitoring: ', result.reason.message)
      }
    }
  }

  private async startMonitoring(serialMonitor: SerialMonitorsData): Promise<SerialMonitorsData> {
    // If the port is already monitored, stop that first
    if (this.monitors.has(serialMonitor.id)) {
      logger.warn('Serial monitor for port %s already running, stopping the old one first ...', serialMonitor.port)
      await this.stopMonitoring(serialMonitor)
    }

    return new Promise((resolve, reject) => {
      let port = new SerialPort(serialMonitor.port, { autoOpen: false, baudRate: serialMonitor.baudRate })
      this.monitors.set(serialMonitor.id, port)

      // Register for the open event
      port.on('open', () => {
        let parser = port.pipe(new InterByteTimeout({ interval: serialMonitor.timeout }))
        parser.on('data', (data: any) => this.notifyListeners(data, serialMonitor))

        resolve(serialMonitor)
      })

      // Set up error logging for unhandled errors
      port.on('error', error => {
        logger.error('Serial monitor for %s reports: %s', serialMonitor.port, error)
      })

      port.on('close', error => {
        if (error?.disconnected) {
          logger.error('Serial port %s disconnected', serialMonitor.port)
        }
        logger.info('Serial monitor for %s stopped', serialMonitor.port)
      })

      // Open the port and clean up if there has been an error
      port.open(error => {
        if (error) {
          this.monitors.delete(serialMonitor.id)
          reject(new Error('Could not open serial port: ' + error.message))
        }
      })
    })
  }

  private async stopMonitoring(serialMonitor: SerialMonitorsData): Promise<SerialMonitorsData> {
    return new Promise((resolve, reject) => {
      if (!this.monitors.has(serialMonitor.id)) {
        // No monitor seems to be running for this port
        resolve(serialMonitor)
        return
      }

      let monitor = this.monitors.get(serialMonitor.id)
      if (!monitor) {
        // The stored monitor is invalid, just remove it
        this.monitors.delete(serialMonitor.id)
        resolve(serialMonitor)
        return
      }

      monitor.close(error => {
        if (error) {
          reject(new Error(`Error closing port ${serialMonitor.port}: ${error.message}`))
          return
        }

        this.monitors.delete(serialMonitor.id)
        resolve(serialMonitor)
      })
    })
  }

  private async notifyListeners(alarmText: string, portToWatch: SerialMonitorsData) {
    logger.info('Recieved alarm: %s', alarmText)
    let context: AlarmContext = {pager_id: portToWatch.id, alarmText: alarmText, port: portToWatch.port};
    // @ts-ignore TypeScript does not know that this is an EventEmitter
    this.emit('pager_alarm', context)
  }

  async _create(data: Partial<SerialMonitorsData> | Array<Partial<SerialMonitorsData>>, params?: Params): Promise<SerialMonitorsData[] | SerialMonitorsData> {
    let result = await super._create(data, params)

    let activeSerialMonitors: SerialMonitorsData[] = []
    if (Array.isArray(result)) {
      activeSerialMonitors = result.filter(serialMonitor => serialMonitor.active)
    } else if (result.active) {
      activeSerialMonitors = [result]
    }
    await this.bulkStartMonitoring(activeSerialMonitors)

    return result;
  }

  async _remove(id: NullableId, params?: Params): Promise<SerialMonitorsData> {
    let serialMonitor = await super._remove(id, params);
    try {
      await this.stopMonitoring(serialMonitor)
    } catch (e) {
      logger.warn('Serial monitor has been removed, but closing the port gave an error:', e.message)
    }
    return serialMonitor;
  }
}
