import {TextAnalysisConfig} from '../../../declarations';

export default {
  name: 'ILS Rosenheim',
  beginningMark: /Alarmfax der ILS Rosenheim/,
  endMark: /\n.*ENDE ALARMFAX.*\n/,
  importantWords: [
    'MITTEILER',
    'EINSATZORT',
    'PATIENT',
    'EINSATZGRUND',
    'TETRA',
    'EINSATZMITTEL',
    'BEMERKUNG',
    'EINSATZHINWEIS',
    'ENDE',
    'ALARMFAX',
  ],
  sections: [
    {
      beginningMark: /Alarmfax der ILS Rosenheim/,
      regexps: [
        /Einsatz-Nr\.[:;=] (?<ref>.*)/
      ]
    },
    {
      beginningMark: /MITTEILER/,
      regexps: [
        /Name\s+[:;=](?<caller_name>.*)/,
        /Rufnummer\s+[:;=](?<caller_number>.*)/
      ]
    },
    {
      beginningMark: /EINSATZORT/,
      regexps: [
        /--\s*(?<loc_gk_x>\d+)\s+(?<loc_gk_y>\d+)$/,
        /Straße\s+[:;=](?<loc_street>.*?)(?<loc_streetnumber>\d+.*)?$/,
        /Ortsteil\s+[:;=](?<loc_district>.+)\s-\s/,
        /Gemeinde\s+[:;=](?<loc_municipality>.+)/,
        /Objekt\s+[:;=](?<loc_name>.+)/
      ]
    },
    {
      beginningMark: /PATIENT/,
      regexps: []
    },
    {
      beginningMark: /EINSATZGRUND/,
      regexps: [
        /Schlagw[-.]\s+[:;=](?<reason>.+)/,
        /Stichwort\s+[:;=](?<keyword>.+)/
      ]
    },
    {
      beginningMark: /TETRA/,
      regexps: []
    },
    {
      beginningMark: /EINSATZMITTEL/,
      regexps: [
        /Name\s+[:;=](?<resources>.*)/
      ]
    },
    {
      beginningMark: /BEMERKUNG/,
      regexps: [
        /\n(?<description>.*)\n(?<!\nEinsatzplan:\s*\n)/ms
      ]
    },
    {
      beginningMark: /EINSATZHINWEIS/,
      regexps: []
    },
  ],
  triggerWords: ['Alarmfax']
} as TextAnalysisConfig;
