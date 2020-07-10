import {SetupMethod} from '@feathersjs/feathers'
import {Application} from '../../declarations'
import logger from '../../logger'

interface Config {
  beginningMark: string,
  endMark: string,
  sections: SectionDefinition[],
  triggerWords: string[]
}

interface SectionDefinition {
  beginningMark: RegExp,
  regexps: RegExp[]
}

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
    const config: Config = {
      beginningMark: 'Alarmfax der ILS Augsburg',
      endMark: 'ENDE FAX',
      sections: [
        {
          beginningMark: /MITTEILER/,
          regexps: []
        },
        {
          beginningMark: /EINSATZORT/,
          regexps: [
            /Straße\s*[:|=](?<loc_street>.*)Haus-Nr\.[:|=](?<loc_streetnumber>.*)$/,
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
            /Schlagw\.[:|=]\s(?<title>.*)$/,
            /Stichwort[:|=]\s(?<keyword>.*)$/
          ]
        },
        {
          beginningMark: /EINSATZMITTEL/,
          regexps: []
        },
        {
          beginningMark: /BEMERKUNG/,
          regexps: [
            /Einsatzplan[:|=](?<description>.*)/
          ]
        }
      ],
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

    // Break the text into sections
    let sections = this.splitIntoSections(text, config);


    // Analyse each section
    let matches = new Map<string, string>()
    for (const [sectionDefinition, sectionText] of sections.entries()) {
      let data = this.processSection(sectionText, sectionDefinition)
      if (data.size > 0) {
        logger.debug('Section reported matches:', data.entries())
        data.forEach((value, key) => {
          if (matches.has(key)) {
            logger.warn('We already have a value for key %s', key)
            return
          }

          matches.set(key, value)
        })
      }
    }

    let alarm: AlertInfo = { time: new Date() }

    logger.debug(matches.entries())
    logger.debug(alarm);
  }

  private checkForTriggerWords (text: string, triggerWords: string[]) {
    let foundTriggerWords = 0
    for (const word of triggerWords) {
      if (text.includes(word)) {
        foundTriggerWords++
      }
    }

    return foundTriggerWords
  }

  private splitIntoSections (text: string, config: Config) : Map<SectionDefinition, string> {
    const map = new Map<SectionDefinition, string>()
    const sections: string[] = []
    let textToSplit = text
    config.sections.forEach((section, index) => {
      const [previousSection, rest] = textToSplit.split(section.beginningMark, 2)
      textToSplit = rest

      // Skip everything before the first section
      if (index === 0) {
        return
      }

      sections.push(previousSection)
    })

    // Everything until the end mark is the last section
    let [lastSection] = textToSplit.split(config.endMark, 1)
    sections.push(lastSection)

    if (config.sections.length !== sections.length) {
      logger.warn('Found %d sections, but expected to find %d sections', sections.length, config.sections.length)
      logger.debug(sections)
    }

    config.sections.forEach((section, index) => {
      map.set(section, sections[index])
    })

    return map
  }

  private processSection (text: string, sectionDefinition: SectionDefinition): Map<string, string> {
    let matches = new Map<string, string>();

    let lines = text.split('\n');

    lines.forEach(function (line) {
      // Remove whitespace from beginning and end of the line
      line = line.trim();

      // Empty lines can be skipped
      if (line === '') {
        return;
      }

      // Only use one kind of dash
      line = line.replace(/[–—]/gi, '-');

      for (const regex of sectionDefinition.regexps) {
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
    })

    return matches
  }
}
