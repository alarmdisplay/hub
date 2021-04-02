import {NullableId, Params} from "@feathersjs/feathers";
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, AlarmContext } from '../../declarations';
import logger from '../../logger';
import { v4 as uuidv4 } from 'uuid';

interface serialMonitorData {
  id: number,
  port: string,
  active: boolean,
  timeout: number
}

export class Serialmonitor extends Service<serialMonitorData> {
  private app: Application
  private serialPort: any
  private InterByteTimeout: any
  private port: any
  private parser: any

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app
    this.serialPort = require('serialport')
    this.InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
  
  }

  setup (app: Application){
    (app.get('databaseReady') as Promise<void>).then(() => this.find({ query: { active: true }, paginate: false }))
    .then(ports => {
      if (!Array.isArray(ports)) {
        logger.error('Query for serial ports did not return an Array')
        return
      }

      Promise.all(ports.map(ser_port => this.startMonitoring(ser_port)))
          .catch(reason => {
            logger.error('Could not start to monitor serial port', reason)
          })

    })
  }

  private async startMonitoring(portToWatch: serialMonitorData){
    this.port = new this.serialPort(portToWatch.port)
    this.parser = this.port.pipe(new this.InterByteTimeout({ interval: portToWatch.timeout }))
    this.parser.on('data', (data: any) => this.notifyListeners(data, portToWatch))
    logger.info('Start monitoring %s', portToWatch.port)
  }

  private async notifyListeners(alarmText: string, portToWatch: serialMonitorData){
    logger.info('Recieved alarm: %s', alarmText)
    let context: AlarmContext = {pager_id: portToWatch.id, alarmText: alarmText, port: portToWatch.port};
    // @ts-ignore TypeScript does not know that this is an EventEmitter
    this.emit('pager_alarm', context)
  }
}
