import app from '../../../src/app';

describe('\'input/pager\' service', () => {
  it('registered the service', () => {
    const service = app.service('input/pager');
    expect(service).toBeTruthy();
  });
});
