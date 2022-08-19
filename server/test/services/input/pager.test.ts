import app from '../../../src/app';
import { BadRequest, NotFound } from '@feathersjs/errors';
import { ResourceData } from '../../../src/declarations';

describe('\'input/pager\' service', () => {
  beforeAll(async () => {
    app.setup();
    await (app.get('databaseReady') as Promise<void>);
  });

  it('registered the service', () => {
    const service = app.service('input/pager');
    expect(service).toBeTruthy();
  });

  it('rejects wrong selcall formats', async () => {
    const service = app.service('input/pager');
    await expect(service.create({ selcall: 'some text' })).rejects.toBeInstanceOf(BadRequest);
    await expect(service.create({ selcall: 'ABCDE' })).rejects.toBeInstanceOf(BadRequest);
    await expect(service.create({ selcall: '123' })).rejects.toBeInstanceOf(BadRequest);
    await expect(service.create({ selcall: '123456' })).rejects.toBeInstanceOf(BadRequest);
    await expect(service.create({ selcall: '' })).rejects.toBeInstanceOf(BadRequest);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Allow invalid data format
    await expect(service.create({})).rejects.toBeInstanceOf(BadRequest);
  });

  it('rejects unknown selcalls', async () => {
    const service = app.service('input/pager');
    await expect(service.create({ selcall: '99999' })).rejects.toBeInstanceOf(NotFound);
  });

  it('creates an incident for a known selcall', async () => {
    const resource = await app.service('resources').create({ name: 'foo', type: 'other' }) as ResourceData;
    await app.service('resource-identifiers').create({ type: 'selcall', value: '99999', resourceId: resource.id });

    const response = await app.service('input/pager').create({ selcall: '99999' });

    expect(response).toHaveProperty('incidentId');
    const incident = await app.service('incidents').get(response.incidentId);
    expect(incident).toHaveProperty('resources');
    expect(incident.resources).toHaveLength(1);
    expect(incident.resources[0].id).toStrictEqual(resource.id);
  });
});
