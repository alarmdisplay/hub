import app from '../../src/app';
import { SerialPort, SerialPortMock } from 'serialport';
import { MockBinding } from '@serialport/binding-mock';
import { SerialMonitorsData } from '../../src/services/serial-monitors/serial-monitors.class';

jest.mock('serialport', () => {
  return {
    ...jest.requireActual('serialport'),
    SerialPort: jest.fn().mockImplementation((options) => new SerialPortMock(options)),
  };
});
const mockConstructor = jest.spyOn(SerialPort.prototype, 'constructor');
const mockOpen = jest.spyOn(SerialPortMock.prototype, 'open');

describe('\'serial-monitors\' service', () => {
  beforeAll(async () => {
    app.setup();
    await (app.get('databaseReady') as Promise<void>);
  });

  it('registered the service', () => {
    const service = app.service('serial-monitors');
    expect(service).toBeTruthy();
  });

  it('creates an inactive monitor and does not start it', async () => {
    const service = app.service('serial-monitors');
    await service.create({ port: '/dev/test_never', active: false, baudRate: 9600 });
    expect(mockOpen).not.toHaveBeenCalled();
    jest.clearAllMocks();
  });

  it('creates an active monitor and starts it', async () => {
    MockBinding.createPort('/dev/test_open', { echo: true });

    const service = app.service('serial-monitors');
    await service.create({ port: '/dev/test_open', active: true, baudRate: 9600 });

    expect(mockConstructor.mock.lastCall?.at(0)).toHaveProperty('path', '/dev/test_open');
    expect(mockConstructor.mock.lastCall?.at(0)).toHaveProperty('baudRate', 9600);
    expect(mockOpen).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
  });

  it('emits serial_data event', (done) => {
    MockBinding.createPort('/dev/test_emit', { echo: true });
    const dataToSend = Buffer.from('49cc2e289d', 'hex');

    let serialMonitor: SerialMonitorsData;
    const service = app.service('serial-monitors');
    service.on('serial_data', event => {
      expect(event).toHaveProperty('serialMonitorId', serialMonitor.id);
      expect(event).toHaveProperty('data', dataToSend);

      jest.clearAllMocks();
      done();
    });

    (service.create({ port: '/dev/test_emit', active: true, baudRate: 9600 }) as Promise<SerialMonitorsData>)
      .then(monitor => {
        serialMonitor = monitor;

        // Acquire serial port mock and send data through it
        const result = mockConstructor.mock.results.at(0)!;
        expect(result).toHaveProperty('type', 'return');
        const serialPortMock = result.value as SerialPortMock;
        serialPortMock.write(dataToSend, err => {
          if (err) {
            done(err);
          }
        });
      }).catch(reason => {
        done(reason);
      });
  });
});
