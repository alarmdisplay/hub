import {TextAnalysisConfig} from '../../../declarations'

export default {
  name: 'ILS Augsburg',
  beginningMark: /Alarmfax der ILS Augsburg/,
  endMark: /\n.*ENDE FAX.*\n/,
  importantWords: [
    'MITTEILER',
    'EINSATZORT',
    'ZIELORT',
    'EINSATZGRUND',
    'EINSATZMITTEL',
    'BEMERKUNG',
    'ENDE',
    'FAX',
    'Absender',
    'Einsatznummer',
    'Rückrufnummer',
    'Straße',
    'Ort',
    'Koordinate',
    'Einsatzplan',
  ],
  sections: [
    {
      beginningMark: /Alarmfax der ILS Augsburg/,
      regexps: [
        /Absender [:;=] (?<sender>.*) Tel/,
        /Einsatznummer (?:.*)[:;=] (?<ref>.*)/
      ]
    },
    {
      beginningMark: /MITTEILER/,
      regexps: [
        /Name\s*[:;=](?<caller_name>.*)Rückrufnummer[:;=](?<caller_number>.*)/
      ]
    },
    {
      beginningMark: /EINSATZORT/,
      regexps: [
        /Straße\s*[:;=](?<loc_street>.*)Haus-Nr\.[:;=]\s*(?<loc_streetnumber>\d+(?:\s?[a-z])?)(?<loc_detail>\s+.*)?$/,
        /Ort\s*[:;=]\s*(?<loc_zip>\d{5}) (?<loc_city>\w+)/,
        /Koordinate\s*[:;=]\s(?<loc_gk_x>\d+[,.]\d+) \/ (?<loc_gk_y>\d+[,.]\d+)$/
      ]
    },
    {
      beginningMark: /ZIELORT/,
      regexps: []
    },
    {
      beginningMark: /EINSAT[AZ]GRUND/,
      regexps: [
        /Schlagw\.[:;=]\s(?<reason>.*)$/,
        /Stichwort[:;=]\s(?<keyword>.*)$/
      ]
    },
    {
      beginningMark: /EINSATZMITTEL/,
      regexps: [
        /(?<resources>.*) \(Ausger/
      ]
    },
    {
      beginningMark: /BEMERKUNG/,
      regexps: [
        /Einsatzplan[:;=](?<description>(?:.|\n)*)/m
      ]
    }
  ],
  triggerWords: ['Alarmfax']
} as TextAnalysisConfig
