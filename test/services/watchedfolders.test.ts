import app from '../../src/app';

describe('\'watchedfolders\' service', () => {
  it('registered the service', () => {
    const service = app.service('watchedfolders');
    expect(service).toBeTruthy();
  });
});
