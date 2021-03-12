import app from '../../src/app';

describe('\'print-tasks\' service', () => {
  it('registered the service', () => {
    const service = app.service('print-tasks');
    expect(service).toBeTruthy();
  });
});
