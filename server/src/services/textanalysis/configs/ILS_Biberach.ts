import {TextAnalysisConfig} from '../../../declarations';

export default {
  name: 'ILS Biberach',
  sections: [
    {
      beginningMark: /Alarmdruck/,
      regexps: [
        /^\s*(?<ref>\d+)/,
        /(?<sender>Integrierte Leitstelle Biberach)/
      ]
    },
    {
      beginningMark: /Einsatzanlass/,
      regexps: [
        /Meldebild\s+(?<reason>.*?)\s+Datum/,
        /Bemerkung\s+(?!GEBIET_UND_BEZEICHNUNG)(?<description>[^\s].*?)(?:^\s+Mit Sondersignal|^\w)/ms,
        /Stichwort\s.+\sStichwort 2\s+(?<keyword>[^-\s].*)/,
        /Stichwort\s+(?<keyword>[^-\s].*?)\s+Stichwort 2\s/
      ]
    },
    {
      beginningMark: /Einsatzort/,
      regexps: [
        /Ortsteil\s+(?<loc_city>.+?)/,
        /Ort\s+(?<loc_city>.+?)\s+\[(?<loc_zip>\d{5})]/,
        /Straße\s+(?<loc_street>\D+)(?<loc_streetnumber>.*)/,
        /Ortszusatz\s+(?<loc_detail>.+)$/,
        /Bemerkung\s+(?<description>.+)$/,
      ]
    },
    {
      beginningMark: /Einsatzstatus/,
      regexps: []
    },
    {
      beginningMark: /EM\s+alarmiert.*\n/,
      regexps: [
        /(?<resources>.*?)\s{5,}/
      ]
    },
    {
      beginningMark: /Eskalationsstufe/,
      regexps: []
    }
  ],
  triggerWords: ['Alarmdruck']
} as TextAnalysisConfig;
