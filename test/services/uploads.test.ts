import app from '../../src/app';

describe('\'uploads\' service', () => {
  it('registered the service', () => {
    const service = app.service('uploads');
    expect(service).toBeTruthy();
  });
});
