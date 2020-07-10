import {SetupMethod} from '@feathersjs/feathers'
import {Application} from '../../declarations'
import logger from '../../logger'

interface AlertInfo {
  title?: string,
  keyword?: string,
  location?: Location,
  description?: string,
  time: Date
}

interface Location {
  raw: string,
  gk?: GaussKrueger
}

interface GaussKrueger {
  x: Number,
  y: Number
}

export class TextAnalysis implements SetupMethod {
  app: Application;

  constructor (app: Application) {
    this.app = app
  }

  setup(app: Application, path: string): void {
  }

  analyse(text: string) {
    const config = {
      beginningMark: 'Alarmfax der ILS Augsburg',
      endMark: 'ENDE FAX',
      sections: new Map<String, RegExp[]>([
        ['MITTEILER', []],
        ['EINSATZORT', [
          /Straße\s*[:|=](?<loc_street>.*)Haus-Nr\.[:|=](?<loc_streetnumber>.*)$/,
          /Ort\s*[:|=]\s*(?<loc_zip>\d{5}) (?<loc_city>\w+)/,
          /Koordinate\s*[:|=]\s(?<loc_gk_x>\d+[,.]\d+) \/ (?<loc_gk_y>\d+[,.]\d+)$/
        ]],
        ['ZIELORT', []],
        ['EINSATZGRUND', [
          /Schlagw\.[:|=]\s(?<title>.*)$/,
          /Stichwort[:|=]\s(?<keyword>.*)$/
        ]],
        ['EINSATZMITTEL', []],
        ['BEMERKUNG', [
          /Einsatzplan[:|=](?<description>.*)/
        ]]
      ]),
      triggerWords: ['Alarmfax']
    }

    logger.debug('Got input:', text);

    // Check for certain trigger words to make sure we try to apply the correct config
    if (config.triggerWords.length > 0) {
      let foundWords = this.checkForTriggerWords(text, config.triggerWords)
      logger.debug('Found %d of %d trigger words', foundWords, config.triggerWords.length)
      if (foundWords === 0) {
        logger.warn('Did not find a single trigger word, aborting analysis')
        return
      }
    }

    let lines = text.split('\n');

    let currentSection: string;
    let sectionIndex = -1
    let sectionRegExps: RegExp[] = []
    let matches = new Map<string, string>()

    let alarm: AlertInfo = { time: new Date() }

    let processLines = false
    lines.forEach(function (line) {
      // Remove whitespace from beginning and end of the line
      line = line.trim();

      // Empty lines can be skipped
      if (line === '') {
        return;
      }

      // Only use one kind of dash
      line = line.replace(/[–—]/gi, '-');

      // Start and stop processing of the lines based on the marks
      if (!processLines && line.includes(config.beginningMark)) {
        processLines = true
      } else if (processLines && line.includes(config.endMark)) {
        processLines = false
      }

      if (!processLines) {
        return
      }

      // Determine the current section
      const nextSection = (Array.from(config.sections.keys()))[sectionIndex + 1]
      if (nextSection && line.includes(nextSection.toString())) {
        currentSection = nextSection.toString()
        sectionRegExps = config.sections.get(currentSection) || []
        sectionIndex++
        logger.debug('Current section', currentSection)
      }

      for (const regex of sectionRegExps) {
        let match = line.match(regex)
        if (!match) {
          continue
        }

        logger.debug(match)
        if (!match.groups) {
          logger.warn('No match groups')
          continue
        }

        for (const [key, value] of Object.entries(match.groups)) {
          if (matches.has(key)) {
            logger.warn('We already have a match for %s', key)
            continue
          }

          matches.set(key, value)
        }
      }
    });
    logger.debug(matches.entries())
    logger.debug(alarm);
  }

  checkForTriggerWords (text: string, triggerWords: string[]) {
    let foundTriggerWords = 0
    for (const word of triggerWords) {
      if (text.includes(word)) {
        foundTriggerWords++
      }
    }

    return foundTriggerWords
  }
}
