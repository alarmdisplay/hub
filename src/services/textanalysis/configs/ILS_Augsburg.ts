import {Config} from '../../../declarations'

export default {
  beginningMark: /Alarmfax der ILS Augsburg/,
  endMark: /\n.*ENDE FAX.*\n/,
  sections: [
    {
      beginningMark: /Alarmfax der ILS Augsburg/,
      regexps: [
        /Absender : (?<sender>.*) Tel/,
        /Einsatznummer (?:.*): (?<ref>.*)/
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
        /Straße\s*[:|=](?<loc_street>.*)Haus-Nr\.[:|=]\s*(?<loc_streetnumber>\d+(?:\s?[a-z])?)(?<loc_detail>\s+.*)?$/,
        /Ort\s*[:|=]\s*(?<loc_zip>\d{5}) (?<loc_city>\w+)/,
        /Koordinate\s*[:|=]\s(?<loc_gk_x>\d+[,.]\d+) \/ (?<loc_gk_y>\d+[,.]\d+)$/
      ]
    },
    {
      beginningMark: /ZIELORT/,
      regexps: []
    },
    {
      beginningMark: /EINSATZGRUND/,
      regexps: [
        /Schlagw\.[:|=]\s(?<reason>.*)$/,
        /Stichwort[:|=]\s(?<keyword>.*)$/
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
        /Einsatzplan[:|=](?<description>(?:.|\n)*)/m
      ]
    }
  ],
  triggerWords: ['Alarmfax']
} as Config
