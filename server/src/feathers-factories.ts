import FeathersApp from './app';
import { Factory } from 'feathers-factory';
import { faker } from '@faker-js/faker/locale/de';

export const IncidentFactory = new Factory(FeathersApp.service('incidents'), {
  id: () => faker.number.int(),
  time: () => new Date(),
  status: () => faker.helpers.arrayElement<'Actual' | 'Exercise' | 'Test'>(['Actual', 'Exercise', 'Test']),
  category: () => faker.helpers.arrayElement<'Geo' | 'Met' | 'Safety' | 'Security' | 'Rescue' | 'Fire' | 'Health' | 'Env' | 'Transport' | 'Infra' | 'CBRNE' | 'Other'>(['Geo', 'Met', 'Safety', 'Security', 'Rescue', 'Fire', 'Health', 'Env', 'Transport', 'Infra', 'CBRNE', 'Other']),
  caller_name: () => faker.person.fullName(),
  caller_number: () => faker.phone.number(),
  description: () => faker.lorem.paragraphs(2),
  keyword: () => faker.helpers.replaceSymbols('??? #'),
  location: () => LocationFactory.get(),
  reason: () => faker.lorem.words(3),
  ref: () => faker.string.uuid(),
  resources: [],
  sender: () => `Leitstelle ${faker.location.city()}`
});

export const LocationFactory = new Factory(FeathersApp.service('locations'), {
  name: () => faker.company.name(),
  street: () => faker.location.street(),
  number: () => faker.string.numeric(),
  detail: () => faker.location.secondaryAddress(),
  postCode: () => faker.location.zipCode(),
  municipality: () => faker.location.city(),
  district: () => faker.location.county(),
  country: () => faker.location.country(),
  rawText: () => faker.location.streetAddress(true)
});
