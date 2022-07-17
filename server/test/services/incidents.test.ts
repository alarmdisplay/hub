import app from '../../src/app';
import { AlertData, IncidentData } from '../../src/declarations';

describe('\'incidents\' service', () => {
  it('registered the service', () => {
    const service = app.service('incidents');
    expect(service).toBeTruthy();
  });

  it('diff fills empty fields', () => {
    const service = app.service('incidents');
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
    const service = app.service('incidents');
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
