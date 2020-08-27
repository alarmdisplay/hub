import app from '../../src/app';

describe('\'resources\' service', () => {
  it('registered the service', () => {
    const service = app.service('resources');
    expect(service).toBeTruthy();
  });
});
