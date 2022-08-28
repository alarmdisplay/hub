import app from '../../src/app';
import { IncidentData } from '../../src/declarations';
import { AlertData } from '../../src/services/alerts/alerts.class';

describe('\'Alerts\' service', () => {
  beforeAll(async () => {
    app.setup();
    await (app.get('databaseReady') as Promise<void>);
  });

  afterEach(async () => {
    await app.service('locations')._remove(null);
    await app.service('incidents')._remove(null);
  });

  it('registered the service', () => {
    const service = app.service('alerts');
    expect(service).toBeTruthy();
  });

  it('creates a new incident with minimal data', async () => {
    const incident = await app.service('alerts').create({});
    expect(incident).toHaveProperty('id');
    expect(incident.id).toBeGreaterThan(0);
    expect(incident.time.valueOf() / 1000).toBeCloseTo(Date.now() / 1000, 0);
    expect(incident).toMatchObject({
      status: 'Actual',
      category: 'Other',
      caller_name: '',
      caller_number: '',
      description: '',
      keyword: '',
      reason: '',
      ref: '',
      resources: [],
      sender: ''
    });
  });

  it('creates a new incident with the given data', async () => {
    const incident = await app.service('alerts').create({
      caller_name: 'Foo Bar',
      caller_number: '+49123456789',
      description: 'Something happened',
      keyword: 'XYZ 1',
      location: {
        name: 'A known address',
        street: 'Main Street',
        streetnumber: '3',
        detail: 'backyard',
        zip: '19843',
        municipality: 'Some city',
        district: 'Suburb'
      },
      reason: 'Fire',
      ref: '1337',
      resources: [],
      sender: 'Dispatch'
    });
    expect(incident).toHaveProperty('id');
    expect(incident.id).toBeGreaterThan(0);
    expect(incident.time.valueOf() / 1000).toBeCloseTo(Date.now() / 1000, 0);
    expect(incident).toMatchObject({
      status: 'Actual',
      category: 'Other',
      caller_name: 'Foo Bar',
      caller_number: '+49123456789',
      description: 'Something happened',
      keyword: 'XYZ 1',
      location: {
        name: 'A known address',
        street: 'Main Street',
        number: '3',
        detail: 'backyard',
        district: 'Suburb',
        postCode: '19843',
        municipality: 'Some city',
        country: '',
        rawText: 'Main Street 3, backyard\n19843 Suburb'
      },
      reason: 'Fire',
      ref: '1337',
      resources: [],
      sender: 'Dispatch'
    });
  });

  it('diff fills empty fields', () => {
    const service = app.service('alerts');
    const date = new Date();
    const incident: IncidentData = {
      id: 2531,
      caller_name: '',
      caller_number: '',
      category: 'Other',
      description: '',
      keyword: '',
      location: undefined,
      reason: '',
      ref: '',
      resources: [],
      sender: '',
      status: 'Actual',
      time: date
    };
    const alert: AlertData = {
      reason: 'Something happened',
      keyword: 'F1',
      description: 'Some description',
      sender: 'Dispatch center',
      ref: 'ABC 4711',
      caller_name: 'Mr. Smith',
      caller_number: '123456789'
    };
    const diff = service.getIncidentDiff(incident, alert);
    expect(diff).toStrictEqual({
      caller_name: 'Mr. Smith',
      caller_number: '123456789',
      description: 'Some description',
      keyword: 'F1',
      reason: 'Something happened',
      ref: 'ABC 4711',
      sender: 'Dispatch center'
    });
  });

  it('diff does not overwrite filled fields', () => {
    const service = app.service('alerts');
    const date = new Date();
    const incident: IncidentData = {
      id: 4651,
      caller_name: 'Wood',
      caller_number: '987654321',
      category: 'Other',
      description: 'Something\'s burning',
      keyword: 'B3',
      location: undefined,
      reason: 'Fire',
      ref: '0815',
      resources: [],
      sender: 'Dispatch center',
      status: 'Actual',
      time: date
    };
    const alert: AlertData = {
      reason: 'Something happened',
      keyword: 'F1',
      description: 'Some description',
      sender: 'Dispatch center',
      ref: 'ABC 4711',
      caller_name: 'Smith',
      caller_number: '123456789'
    };
    const diff = service.getIncidentDiff(incident, alert);
    expect(diff).toStrictEqual({});
  });
});
