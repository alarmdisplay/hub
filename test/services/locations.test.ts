import app from '../../src/app';

describe('\'locations\' service', () => {
  it('registered the service', () => {
    const service = app.service('locations');
    expect(service).toBeTruthy();
  });
});
