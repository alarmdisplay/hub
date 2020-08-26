import app from '../../src/app';

describe('\'ocr\' service', () => {
  it('registered the service', () => {
    const service = app.service('ocr');
    expect(service).toBeTruthy();
  });
});
