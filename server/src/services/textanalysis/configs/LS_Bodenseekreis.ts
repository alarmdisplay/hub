import {TextAnalysisConfig} from '../../../declarations';

export default {
  name: 'LS Bodensee-Oberschwaben',
  importantWords: [],
  sections: [
    {
      beginningMark: /ENR/,
      regexps: [
        /:(?<ref>\d+) (?<reason>\S+\s\S+) [^,]+, (?<loc_municipality>[^,]+), (?<loc_street>[^,]+), (?<loc_streetnumber>[^,]+)/,
        /, L=(?<loc_wgs84_lon>\d+)\?(?<loc_wgs84_lon_min>\d+)’(?<loc_wgs84_lon_sec>\d+\.\d+)",\sB=(?<loc_wgs84_lat>\d+)\?(?<loc_wgs84_lat_min>\d+)’(?<loc_wgs84_lat_sec>\d+\.\d+)"/
      ]
    },
    {
      beginningMark: /MSG:/,
      regexps: [
        /(?<description>(?:.|\n)*)/m
      ]
    }
  ],
  triggerWords: ['ENR']
} as TextAnalysisConfig;
