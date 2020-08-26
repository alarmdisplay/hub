import app from '../../src/app';

describe('\'api-keys\' service', () => {
  it('registered the service', () => {
    const service = app.service('api-keys');
    expect(service).toBeTruthy();
  });
});
