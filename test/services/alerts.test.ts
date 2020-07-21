import app from '../../src/app';

describe('\'alerts\' service', () => {
  it('registered the service', () => {
    const service = app.service('alerts');
    expect(service).toBeTruthy();
  });
});
