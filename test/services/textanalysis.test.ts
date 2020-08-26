import app from '../../src/app';

describe('\'textanalysis\' service', () => {
  it('registered the service', () => {
    const service = app.service('textanalysis');
    expect(service).toBeTruthy();
  });
});
