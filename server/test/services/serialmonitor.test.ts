import app from '../../src/app';

describe('\'serialmonitor\' service', () => {
  it('registered the service', () => {
    const service = app.service('serialmonitor');
    expect(service).toBeTruthy();
  });
});
