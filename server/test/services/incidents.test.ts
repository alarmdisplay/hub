import app from '../../src/app';

describe('\'incidents\' service', () => {
  it('registered the service', () => {
    const service = app.service('incidents');
    expect(service).toBeTruthy();
  });
});
