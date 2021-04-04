import {TextAnalysisConfig} from '../../../declarations'

export default {
  name: 'LS Bodensee-Oberschwaben',
  beginningMark: /\u0002/,
  endMark: /\u0003/,
  importantWords: [
    'MSG',
  ],
  sections: [
    {beginningMark: /\u0002/,
      regexps: [
        /(?<reason>(\s((.+?)\s){2}))/,
        /(?<loc_city>\w+,)/,
        /(?<loc_detail>,\s\w+)/,
        /(?<=(,\s\w+){1})(?<loc_street>,\s\w+)/,
        /(?<=(,\s\w+){2})(?<loc_streetnumber>,\s\w+)/,
        /(?<loc_gk_x>\d+\?\d+'\d+[,.]\d+"),\s.*(?<loc_gk_y>\d+\?\d+'\d+[,.]\d+")/

      ]},
    {beginningMark: /MSG:/,
      regexps: [
        /(?<description>(?:.|\n)*)/m
      ]}
      
  ],
  triggerWords: ['\u0002']
} as TextAnalysisConfig
