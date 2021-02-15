import {SetupMethod} from '@feathersjs/feathers'
import {Application, Config, SectionDefinition, TextAnalysisResult} from '../../declarations'
import logger from '../../logger'

export class TextAnalysis implements SetupMethod {
  app: Application;
  multiValueKeys: string[]

  constructor (app: Application) {
    this.app = app
    this.multiValueKeys = ['resources']
  }

  setup(app: Application, path: string): void {
  }

  analyse(text: string, config: Config): TextAnalysisResult {
    // Check for certain trigger words to make sure we try to apply the correct config
    if (config.triggerWords.length > 0) {
      let foundWords = this.checkForTriggerWords(text, config.triggerWords)
      if (foundWords === 0) {
        throw new Error('Did not find a single trigger word, aborting analysis')
      }
    }

    // Break the text into sections
    let sections = this.splitIntoSections(text, config);

    // Analyse each section
    let matches = new Map<string, string|string[]>()
    for (const [sectionDefinition, sectionText] of sections.entries()) {
      let data = this.processSection(sectionText, sectionDefinition)
      if (data.size > 0) {
        matches = this.mergeMatches(matches, data)
      }
    }

    // Pass a GaussKrueger object as soon as one of the coordinates has been recognized
    let gk = matches.has('loc_gk_x') || matches.has('loc_gk_y') ? {
      x: matches.get('loc_gk_x') as string || '',
      y: matches.get('loc_gk_y') as string || ''
    }: undefined

    // There might be a more elegant way, but that's for later
    return {
      sender: matches.get('sender') as string || '',
      ref: matches.get('ref') as string || '',
      caller: {
        name: matches.get('caller_name') as string || '',
        number: matches.get('caller_number') as string || ''
      },
      location: {
        street: matches.get('loc_street') as string || '',
        streetnumber: matches.get('loc_streetnumber') as string || '',
        detail: matches.get('loc_detail') as string || '',
        zip: matches.get('loc_zip') as string || '',
        city: matches.get('loc_city') as string || '',
        gk: gk
      },
      reason: matches.get('reason') as string || '',
      keyword: matches.get('keyword') as string || '',
      resources: matches.get('resources') as string[] || [],
      description: matches.get('description') as string || '',
    }
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

      if (!match.groups) {
        logger.warn('RegExp %s has no match groups', regex)
        continue
      }

      for (const [key, value] of Object.entries(match.groups)) {
        if (matches.has(key)) {
          logger.warn('We already have a match for %s', key)
          continue
        }

        // Groups may be undefined
        if (!value) {
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
