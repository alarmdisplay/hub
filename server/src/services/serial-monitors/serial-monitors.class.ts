import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, SerialDataContext } from '../../declarations';
import { InterByteTimeoutParser, SerialPort } from 'serialport';
import { DisconnectedError } from '@serialport/stream';
import logger from '../../logger';
import { Params, NullableId } from '@feathersjs/feathers';
import util from 'util';

export interface SerialMonitorsData {
  id: number
  port: string
  baudRate: number
  active: boolean
  timeout: number
}

export class SerialMonitors extends Service<SerialMonitorsData> {
  private app: Application;
  private monitors: Map<number, SerialPort>;
  private refuseNewMonitors: boolean;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
    this.monitors = new Map<number, SerialPort>();
    this.refuseNewMonitors = false;
  }

  setup (app: Application) {
    // Wait for the database, then start monitoring all serial ports marked as active
    (app.get('databaseReady') as Promise<void>)
      .then(() => this.find({ query: { active: true }, paginate: false }) as Promise<SerialMonitorsData[]>)
      .then(serialMonitors => this.bulkStartMonitoring(serialMonitors))
      .catch(reason => {
        logger.error('Could not query serial ports to monitor: ', reason.message);
      });
  }

  onExit() {
    this.refuseNewMonitors = true;

    if (this.monitors.size > 0) {
      logger.debug('Closing all serial ports ...');
      for (const monitor of this.monitors.values()) {
        // Best effort: Close monitors without callback, as asynchronous events will not run in the 'exit' phase
        monitor.close();
      }
    }
  }

  private async bulkStartMonitoring(serialMonitors: SerialMonitorsData[]) {
    for (const serialMonitor of serialMonitors) {
      try {
        await this.startMonitoring(serialMonitor);
        logger.info('Started monitoring %s', serialMonitor.port);
      } catch (error: any) {
        logger.error('Could not start monitoring: ', error.message);
      }
    }
  }

  private isMonitorRunning(serialMonitor: SerialMonitorsData) {
    return this.monitors.has(serialMonitor.id);
  }

  private async onMonitorUpdated(serialMonitor: SerialMonitorsData) {
    // If the serial port is currently monitored, stop monitoring
    if (this.isMonitorRunning(serialMonitor) && serialMonitor) {
      await this.stopMonitoring(serialMonitor);
    }

    // If the serial port should be monitored, start monitoring (again) with the updated parameters
    if (serialMonitor.active) {
      await this.startMonitoring(serialMonitor);
      logger.info('Started monitoring %s', serialMonitor.port);
    }
  }

  private onSerialData(data: Buffer, serialMonitor: SerialMonitorsData) {
    logger.debug('Serial data on %s: %s', serialMonitor.port, util.inspect(data.toString()));

    // Strip STX and ETX characters, if any
    if (data[0] === 0x2) {
      data = data.slice(1);
    }
    if (data[data.length - 1] === 0x3) {
      data = data.slice(0, -1);
    }

    const context: SerialDataContext = { serialMonitorId: serialMonitor.id, data: data };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TypeScript does not know that this is an EventEmitter
    this.emit('serial_data', context);
  }

  private async startMonitoring(serialMonitor: SerialMonitorsData): Promise<SerialMonitorsData> {
    if (this.refuseNewMonitors) {
      throw new Error('New serial monitors may not be started at this point in time');
    }

    // If the port is already monitored, stop that first
    if (this.isMonitorRunning(serialMonitor)) {
      logger.warn('Serial monitor for port %s already running, stopping the old one first ...', serialMonitor.port);
      await this.stopMonitoring(serialMonitor);
    }

    return new Promise((resolve, reject) => {
      const port = new SerialPort({ path: serialMonitor.port, autoOpen: false, baudRate: serialMonitor.baudRate });
      this.monitors.set(serialMonitor.id, port);

      // Register for the open event
      port.on('open', () => {
        const parser = port.pipe(new InterByteTimeoutParser({ interval: serialMonitor.timeout }));
        parser.on('data', (data: Buffer) => this.onSerialData(data, serialMonitor));

        resolve(serialMonitor);
      });

      // Set up error logging for unhandled errors
      port.on('error', error => {
        logger.error('Serial monitor for %s reports: %s', serialMonitor.port, error);
      });

      port.on('close', (error: unknown) => {
        if (error instanceof DisconnectedError) {
          logger.error('Serial port %s disconnected', serialMonitor.port);
        }
        logger.info('Serial monitor for %s stopped', serialMonitor.port);
      });

      // Open the port and clean up if there has been an error
      port.open(error => {
        if (error) {
          this.monitors.delete(serialMonitor.id);
          reject(new Error('Could not open serial port: ' + error.message));
        }
      });
    });
  }

  private async stopMonitoring(serialMonitor: SerialMonitorsData): Promise<SerialMonitorsData> {
    return new Promise((resolve, reject) => {
      if (!this.isMonitorRunning(serialMonitor)) {
        // No monitor seems to be running for this port
        resolve(serialMonitor);
        return;
      }

      const monitor = this.monitors.get(serialMonitor.id);
      if (!monitor) {
        // The stored monitor is invalid, just remove it
        this.monitors.delete(serialMonitor.id);
        resolve(serialMonitor);
        return;
      }

      monitor.close(error => {
        if (error) {
          reject(new Error(`Error closing port ${serialMonitor.port}: ${error.message}`));
          return;
        }

        this.monitors.delete(serialMonitor.id);
        resolve(serialMonitor);
      });
    });
  }

  async _create(data: Partial<SerialMonitorsData> | Array<Partial<SerialMonitorsData>>, params?: Params): Promise<SerialMonitorsData[] | SerialMonitorsData> {
    const result = await super._create(data, params);

    let activeSerialMonitors: SerialMonitorsData[] = [];
    if (Array.isArray(result)) {
      activeSerialMonitors = result.filter(serialMonitor => serialMonitor.active);
    } else if (result.active) {
      activeSerialMonitors = [result];
    }
    await this.bulkStartMonitoring(activeSerialMonitors);

    return result;
  }

  async _update(id: NullableId, data: SerialMonitorsData, params?: Params): Promise<SerialMonitorsData> {
    const serialMonitor = await super._update(id, data, params);
    await this.onMonitorUpdated(serialMonitor);
    return serialMonitor;
  }

  async _patch(id: NullableId, data: Partial<SerialMonitorsData>, params?: Params): Promise<SerialMonitorsData> {
    const serialMonitor = await super._patch(id, data, params);
    await this.onMonitorUpdated(serialMonitor);
    return serialMonitor;
  }

  async _remove(id: NullableId, params?: Params): Promise<SerialMonitorsData> {
    const serialMonitor = await super._remove(id, params);
    try {
      await this.stopMonitoring(serialMonitor);
    } catch (error: any) {
      logger.warn('Serial monitor has been removed, but closing the port gave an error:', error.message);
    }
    return serialMonitor;
  }
}
