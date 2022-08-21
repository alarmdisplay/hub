import app from '../../src/app';
import { IncidentData } from '../../src/declarations';
import { AlertData } from '../../src/services/alerts/alerts.class';

describe('\'incidents\' service', () => {
  it('registered the service', () => {
    const service = app.service('incidents');
    expect(service).toBeTruthy();
  });
});
