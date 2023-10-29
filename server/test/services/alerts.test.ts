import app from '../../src/app';
import { IncidentData } from '../../src/declarations';
import { AlertData } from '../../src/services/alerts/alerts.class';
import { IncidentFactory } from '../../src/feathers-factories';
import { AlertSourceType } from '../../src/services/incidents/incidents.service';
import { faker } from '@faker-js/faker/locale/de';

describe('\'Alerts\' service', () => {
  const minutesBeforeNewIncident = 15;

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

  it('updates a recent incident', async () => {
    const recentIncident = await IncidentFactory.create({
      time: (new Date(Date.now() - (minutesBeforeNewIncident - 1) * 60 * 1000)),
      reason: '',
      keyword: '',
    });
    expect(recentIncident.reason).toStrictEqual('');
    expect(recentIncident.keyword).toStrictEqual('');
    const alertData = {
      reason: 'New reason',
      keyword: 'ABC 123',
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).toStrictEqual(recentIncident.id);
    const updatedIncident = await app.service('incidents').get(recentIncident.id);
    expect(updatedIncident.reason).toStrictEqual(alertData.reason);
    expect(updatedIncident.keyword).toStrictEqual(alertData.keyword);
  });

  it('adds a location to a recent incident', async () => {
    const recentIncident = await IncidentFactory.create({
      time: (new Date(Date.now() - (minutesBeforeNewIncident - 1) * 60 * 1000)),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Weird workaround to create an incident without location
      async location() {
        return undefined;
      },
    });
    expect(recentIncident.location).toBeUndefined();
    const alertData = {
      location: {
        name: 'A known address',
        street: 'Main Street',
        streetnumber: '5',
        detail: 'backyard',
        zip: '19843',
        municipality: 'Some city',
        district: 'Suburb'
      },
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).toStrictEqual(recentIncident.id);
    const updatedIncident = await app.service('incidents').get(recentIncident.id);
    expect(updatedIncident.location).toMatchObject({
      name: 'A known address',
      street: 'Main Street',
      number: '5',
      detail: 'backyard',
      postCode: '19843',
      municipality: 'Some city',
      district: 'Suburb',
    });
  });

  it('updates a recent incident without removing the location', async () => {
    const recentIncident = await IncidentFactory.create({
      keyword: '',
      time: (new Date(Date.now() - (minutesBeforeNewIncident - 1) * 60 * 1000)),
    });
    expect(recentIncident.location).toBeDefined();
    const alertData = {
      keyword: 'updated',
      location: undefined
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).toStrictEqual(recentIncident.id);
    const updatedIncident = await app.service('incidents').get(recentIncident.id);
    expect(updatedIncident.keyword).toStrictEqual(alertData.keyword);
    expect(updatedIncident.location).toStrictEqual(recentIncident.location);
  });

  it('creates new incident when recent incident is too old', async () => {
    const olderIncident = await IncidentFactory.create({
      time: (new Date(Date.now() - (minutesBeforeNewIncident + 1) * 60 * 1000)),
      reason: '',
      keyword: '',
    });
    expect(olderIncident.reason).toStrictEqual('');
    expect(olderIncident.keyword).toStrictEqual('');

    // Alert should cause a new incident
    const alertData = {
      reason: 'Reason',
      keyword: 'DEF 456',
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).not.toStrictEqual(olderIncident.id);
    expect(alertResult.reason).toStrictEqual(alertData.reason);
    expect(alertResult.keyword).toStrictEqual(alertData.keyword);

    // Old incident should not have changed
    const notUpdatedIncident = await app.service('incidents').get(olderIncident.id);
    expect(notUpdatedIncident.reason).toStrictEqual('');
    expect(notUpdatedIncident.keyword).toStrictEqual('');
  });

  it('updates a recent incident with same ref', async () => {
    const ref = '7b690f22-c699-42f0-b187-5bf2c54ead65';
    const recentIncident = await IncidentFactory.create({
      time: (new Date(Date.now() - (minutesBeforeNewIncident - 1) * 60 * 1000)),
      reason: '',
      ref: ref,
    });
    const alertData = {
      reason: 'Reason',
      ref: ref,
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).toStrictEqual(recentIncident.id);
    expect(alertResult.reason).toStrictEqual(alertData.reason);
  });

  it('updates an older incident with same ref', async () => {
    const ref = 'b84333e1-78e4-4c23-88f7-a23aeaa4b89d';
    const olderIncident = await IncidentFactory.create({
      time: faker.date.recent({ days: 3 }),
      reason: '',
      ref: ref,
    });
    const alertData = {
      reason: 'Reason',
      ref: ref,
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).toStrictEqual(olderIncident.id);
    const incident = await app.service('incidents').get(olderIncident.id);
    expect(incident.reason).toStrictEqual(alertData.reason);
  });

  it('creates a new incident when refs differ', async () => {
    const recentIncident = await IncidentFactory.create({
      time: (new Date(Date.now() - (minutesBeforeNewIncident - 1) * 60 * 1000)),
      reason: '',
      ref: '2804ee60-1b87-40ef-a2fd-8e6b42264779',
    });
    const alertData = {
      reason: 'Reason',
      ref: '2383bd18-72d1-434e-afce-21c8754851a8',
    };
    const alertResult = await app.service('alerts').create(alertData);
    expect(alertResult.id).not.toStrictEqual(recentIncident.id);
  });

  it('creates a new incident forced by context', async () => {
    const recentIncident = await IncidentFactory.create({
      time: (new Date(Date.now() - (minutesBeforeNewIncident - 1) * 60 * 1000)),
    });
    const alertResult = await app.service('alerts').create({
      reason: 'Reason',
      context: {
        forceNewIncident: true,
        processingStarted: new Date(),
        source: {
          type: AlertSourceType.PLAIN
        },
        rawContent: ''
      }
    });
    expect(alertResult.id).not.toStrictEqual(recentIncident.id);
  });

  it('creates a new incident during a scheduled alert', async () => {
    await app.service('scheduled-alerts').create({
      status: 'Test',
      keyword: 'TEST 5',
      reason: 'Scheduled test alert',
      begin: (new Date(Date.now() - 5000)),
      end: (new Date(Date.now() + 5000)),
    });
    const incident = await app.service('alerts').create({
      keyword: 'should be ignored',
      reason: 'should be ignored'
    });
    expect(incident.time.valueOf() / 1000).toBeCloseTo(Date.now() / 1000, 0);
    expect(incident).toMatchObject({
      status: 'Test',
      category: 'Other',
      caller_name: '',
      caller_number: '',
      description: '',
      keyword: 'TEST 5',
      reason: 'Scheduled test alert',
      ref: '',
      resources: [],
      sender: ''
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
