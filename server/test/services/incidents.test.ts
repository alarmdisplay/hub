import app from '../../src/app';
import { IncidentData } from '../../src/declarations';
import { IncidentFactory, LocationFactory } from '../../src/feathers-factories';

describe('\'incidents\' service', () => {
  beforeAll(async () => {
    app.setup();
    await (app.get('databaseReady') as Promise<void>);
  });

  afterEach(async () => {
    await app.service('locations')._remove(null);
    await app.service('incidents')._remove(null);
  });

  it('registered the service', () => {
    const service = app.service('incidents');
    expect(service).toBeTruthy();
  });

  it('creates an incident', async () => {
    const data: Partial<IncidentData> = await IncidentFactory.get();
    delete data.id;
    const incident = await app.service('incidents').create(data) as IncidentData;
    expect(incident).toMatchObject(data);
    expect(incident.id).toBeGreaterThan(0);
  });

  it('adds a location to an existing incident', async () => {
    const data: Partial<IncidentData> = await IncidentFactory.get();
    delete data.location;
    const incident = await app.service('incidents').create(data) as IncidentData;
    expect(incident.location).toBeUndefined();
    const location = await LocationFactory.get();
    const patchedIncident = await app.service('incidents').patch(incident.id, {
      location: location
    }) as IncidentData;
    expect(patchedIncident.location).toMatchObject(location);
  });
});
