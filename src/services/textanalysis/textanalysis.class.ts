import {SetupMethod} from '@feathersjs/feathers'
import {Application} from '../../declarations'
import logger from '../../logger'

interface Config {
  beginningMark: RegExp,
  endMark: RegExp,
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
  multiValueKeys: string[]

  constructor (app: Application) {
    this.app = app
    this.multiValueKeys = ['resources']
  }

  setup(app: Application, path: string): void {
  }

  analyse(text: string) {
    const config: Config = {
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
    let matches = new Map<string, string|string[]>()
    for (const [sectionDefinition, sectionText] of sections.entries()) {
      let data = this.processSection(sectionText, sectionDefinition)
      if (data.size > 0) {
        logger.debug('Section reported matches:', data.entries())
        matches = this.mergeMatches(matches, data)
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

  private processSection (text: string, sectionDefinition: SectionDefinition): Map<string, string|string[]> {
    let matches = new Map<string, string|string[]>();

    // Only use one kind of dash
    text = text.replace(/[–—]/gi, '-')

    // If we have regular expressions that work over multiple lines, process the entire text
    const multiLineRegExps = sectionDefinition.regexps.filter(regexp => regexp.multiline)
    if (multiLineRegExps.length > 0) {
      logger.debug('Multiline:', multiLineRegExps)
      let multiLineMatches = this.processText(text, multiLineRegExps)
      matches = this.mergeMatches(matches, multiLineMatches)
    }

    // If we have regular expressions that work on single lines, process the text line by line
    const singleLineRegExps = sectionDefinition.regexps.filter(regexp => !regexp.multiline)
    if (singleLineRegExps.length > 0) {
      let lines = text.split('\n')
      lines.forEach(line => {
        // Remove whitespace from beginning and end of the line
        line = line.trim()

        // Empty lines can be skipped
        if (line === '') {
          return
        }

        let singleLineMatches = this.processText(line, singleLineRegExps)
        matches = this.mergeMatches(matches, singleLineMatches)
      })
    }

    return matches
  }

  /**
   * Executes a list of regular expressions against a piece of text. Regular expressions can be multiline.
   *
   * @param text The piece of text to execute the regular expressions on
   * @param regexps An Array of regular expressions
   *
   * @return A Map of named capture groups and their values
   */
  private processText (text: string, regexps: RegExp[]): Map<string, string> {
    let matches = new Map<string, string>()

    for (const regex of regexps) {
      let match = text.match(regex)
      if (!match) {
        continue
      }

      logger.debug(match)
      if (!match.groups) {
        logger.warn('RegExp %s has no match groups', regex)
        continue
      }

      for (const [key, value] of Object.entries(match.groups)) {
        if (matches.has(key)) {
          logger.warn('We already have a match for %s', key)
          continue
        }

        // Collapse multiple newlines into one and remove whitespace and beginning and end
        let sanitizedValue = value.replace(/\n{2,}/m, '\n')
        sanitizedValue = sanitizedValue.trim()
        matches.set(key, sanitizedValue)
      }
    }

    return matches
  }

  private mergeMatches (matches: Map<string, string|string[]>, newMatches: Map<string, string|string[]>): Map<string, string|string[]> {
    newMatches.forEach((value, key) => {
      if (this.multiValueKeys.includes(key)) {
        let array = (matches.get(key) || []) as string[]
        Array.isArray(value) ? array = array.concat(value) : array.push(value)
        matches.set(key, array)
        logger.debug('%s matches is now', key, matches.get(key))
        return
      }

      if (matches.has(key)) {
        logger.warn('We already have a value for key %s', key)
        return
      }

      matches.set(key, value)
    })

    return matches
  }
}
