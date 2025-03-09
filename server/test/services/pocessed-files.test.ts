import app from '../../src/app';

describe('\'processed files\' service', () => {
  it('registered the service', () => {
    const service = app.service('processed-files');
    expect(service).toBeTruthy();
  });
});
