import FeathersApp from './app';
import { Factory } from 'feathers-factory';
import { faker } from '@faker-js/faker/locale/de';

export const IncidentFactory = new Factory(FeathersApp.service('incidents'), {
  id: () => faker.datatype.number(),
  time: () => new Date(),
  status: () => faker.helpers.arrayElement<'Actual' | 'Exercise' | 'Test'>(['Actual', 'Exercise', 'Test']),
  category: () => faker.helpers.arrayElement<'Geo' | 'Met' | 'Safety' | 'Security' | 'Rescue' | 'Fire' | 'Health' | 'Env' | 'Transport' | 'Infra' | 'CBRNE' | 'Other'>(['Geo', 'Met', 'Safety', 'Security', 'Rescue', 'Fire', 'Health', 'Env', 'Transport', 'Infra', 'CBRNE', 'Other']),
  caller_name: () => faker.name.fullName(),
  caller_number: () => faker.phone.number(),
  description: () => faker.lorem.paragraphs(2),
  keyword: () => faker.helpers.replaceSymbols('??? #'),
  location: () => LocationFactory.get(),
  reason: () => faker.lorem.words(3),
  ref: () => faker.datatype.uuid(),
  resources: [],
  sender: () => `Leitstelle ${faker.address.cityName()}`
});

export const LocationFactory = new Factory(FeathersApp.service('locations'), {
  name: () => faker.company.name(),
  street: () => faker.address.streetName(),
  number: () => faker.random.numeric(),
  detail: () => faker.address.secondaryAddress(),
  postCode: () => faker.address.zipCode(),
  municipality: () => faker.address.cityName(),
  district: () => faker.address.county(),
  country: () => faker.address.country(),
  rawText: () => faker.address.streetAddress(true)
});
