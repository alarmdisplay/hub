import app from '../../src/app';

describe('\'resource-identifiers\' service', () => {
  it('registered the service', () => {
    const service = app.service('resource-identifiers');
    expect(service).toBeTruthy();
  });
});
