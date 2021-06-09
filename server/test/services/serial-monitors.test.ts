import app from '../../src/app';

describe('\'serial-monitors\' service', () => {
  it('registered the service', () => {
    const service = app.service('serial-monitors');
    expect(service).toBeTruthy();
  });
});
