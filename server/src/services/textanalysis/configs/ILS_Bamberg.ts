import {TextAnalysisConfig} from '../../../declarations'

export default {
  name: 'ILS Bamberg',
  beginningMark: /Alarmfax der ILS Bamberg/,
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
    'Rufnummer',
    'Straße',
    'Ort',
    'Koordinaten',
    'Einsatzplan',
  ],
  sections: [
    {
      beginningMark: /Alarmfax der ILS Bamberg/,
      regexps: [
        /Absender [:;=] (?<sender>.*) Tel/,
        /Einsatznummer (?:.*)[:;=] (?<ref>.*)/
      ]
    },
    {
      beginningMark: /MITTEILER/,
      regexps: [
        /Name\s*[:;=](?<caller_name>.*)/,
        /Rufnummer[:;=](?<caller_number>.*)/
      ]
    },
    {
      beginningMark: /EINSATZORT/,
      regexps: [
        /Straße\s*[:;=](?<loc_street>.*)Haus-Nr\.[:;=]\s*(?<loc_streetnumber>\d+(?:\s?[a-z])?)(?<loc_detail>\s+.*)?$/,
        /Ort\s*[:;=]\s*(?<loc_zip>\d{5}) (?<loc_city>\w+)/,
        /Koordinaten\s*[:;=]\sx\s*[:;=]\s(?<loc_gk_x>\d+[,.]\d+)\s\/\sy\s*[:;=]\s(?<loc_gk_y>\d+[,.]\d+)/
      ]
    },
    {
      beginningMark: /EINSATZGRUND/,
      regexps: [
        /Schlagwort[:;=]\s(?<reason>.*)$/
      ]
    },
    {
      beginningMark: /EINSATZMITTEL/,
      regexps: [
        /Einsatzmittelname:\s*(?<resources>.*)/
      ]
    },
    {
      beginningMark: /SPRECHGRUPPE/,
      regexps: []
    },
    {
      beginningMark: /BEMERKUNG/,
      regexps: [
        /(?<description>(?:.|\n)*)/m
      ]
    },
    {
      beginningMark: /OBJEKTINFO/, // Wahrscheinlich optional
      regexps: []
    }
  ],
  triggerWords: ['Alarmfax']
} as TextAnalysisConfig
