import {TextAnalysisConfig} from '../../../declarations'

export default {
  name: 'LS Bodensee-Oberschwaben',
  beginningMark: /Hallo/,
  endMark: /!/,
  importantWords: [
    'Welt',
  ],
  sections: [
    {beginningMark: /Hallo/,
      regexps: [
        /Absender [:;=] (?<sender>.*) Tel/,
        /Einsatznummer (?:.*)[:;=] (?<ref>.*)/
      ]}
      
  ],
  triggerWords: ['Hallo']
} as TextAnalysisConfig
