import app from '../../src/app';

describe('\'Scheduled alerts\' service', () => {
  it('registered the service', () => {
    const service = app.service('scheduled-alerts');
    expect(service).toBeTruthy();
  });
});
