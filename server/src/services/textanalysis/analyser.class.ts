import logger from '../../logger';
import { TextAnalysisConfig, TextAnalysisResult, SectionDefinition } from '../../declarations';

export class Analyser {
  multiValueKeys: string[];

  constructor() {
    this.multiValueKeys = ['resources'];
  }

  analyse(text: string, config: TextAnalysisConfig): TextAnalysisResult {
    if (!config) {
      throw new Error('No valid config given');
    }

    logger.debug('Starting text analysis with config %s', config.name || 'NONAME');
    // Check for certain trigger words to make sure we try to apply the correct config
    if (config.triggerWords.length > 0) {
      const foundWords = this.checkForTriggerWords(text, config.triggerWords);
      if (foundWords === 0) {
        throw new Error('Did not find a single trigger word, aborting analysis');
      }
    }

    // Remove unneeded text
    const shortenedText = this.shortenText(text, config);

    // Break the text into sections
    const sections = this.splitIntoSections(shortenedText, config);

    // Analyse each section
    let matches = new Map<string, string|string[]>();
    for (const [sectionDefinition, sectionText] of sections.entries()) {
      const data = this.processSection(sectionText, sectionDefinition);
      if (data.size > 0) {
        matches = this.mergeMatches(matches, data);
      }
    }

    // Pass a GaussKrueger object as soon as one of the coordinates has been recognized
    const gk = matches.has('loc_gk_x') || matches.has('loc_gk_y') ? {
      x: matches.get('loc_gk_x') as string || '',
      y: matches.get('loc_gk_y') as string || ''
    }: undefined;

    const wgs84 = matches.has('loc_wgs84_lon') && matches.has('loc_wgs84_lat') ? {
      lon: this.getMatchWithoutNewlines(matches, 'loc_wgs84_lon'),
      lon_min: matches.get('loc_wgs84_lon_min') as string || '',
      lon_sec: matches.get('loc_wgs84_lon_sec') as string || '',
      lat: this.getMatchWithoutNewlines(matches, 'loc_wgs84_lat'),
      lat_min: matches.get('loc_wgs84_lat_min') as string || '',
      lat_sec: matches.get('loc_wgs84_lat_sec') as string || ''
    } : undefined;

    // There might be a more elegant way, but that's for later
    return {
      sender: matches.get('sender') as string || '',
      ref: matches.get('ref') as string || '',
      caller: {
        name: matches.get('caller_name') as string || '',
        number: matches.get('caller_number') as string || ''
      },
      location: {
        name: matches.get('loc_name') as string || '',
        street: matches.get('loc_street') as string || '',
        streetnumber: matches.get('loc_streetnumber') as string || '',
        detail: matches.get('loc_detail') as string || '',
        zip: matches.get('loc_zip') as string || '',
        municipality: matches.get('loc_municipality') as string || '',
        district: matches.get('loc_district') as string || '',
        gk: gk,
        wgs84: wgs84
      },
      reason: matches.get('reason') as string || '',
      keyword: matches.get('keyword') as string || '',
      resources: matches.get('resources') as string[] || [],
      description: matches.get('description') as string || '',
    };
  }

  private checkForTriggerWords (text: string, triggerWords: string[]) {
    let foundTriggerWords = 0;
    for (const word of triggerWords) {
      if (text.includes(word)) {
        foundTriggerWords++;
      }
    }

    return foundTriggerWords;
  }

  /**
   * Shortens the text based on the given beginningMark and endMark of the config.
   *
   * @param text
   * @param config
   * @private
   */
  private shortenText (text: string, config: TextAnalysisConfig): string {
    let startIndex: number|undefined = undefined;
    if (config.beginningMark) {
      const index = text.search(config.beginningMark);
      if (index === -1) {
        logger.warn('Beginning mark could not be found');
      } else {
        startIndex = index;
      }
    }

    let endIndex: number|undefined = undefined;
    if (config.endMark) {
      const index = text.search(config.endMark);
      if (index === -1) {
        logger.warn('End mark could not be found');
      } else {
        endIndex = index;
      }
    }

    if (!startIndex && !endIndex) {
      return text;
    }

    return text.slice(startIndex, endIndex);
  }

  private splitIntoSections (text: string, config: TextAnalysisConfig) : Map<SectionDefinition, string> {
    const map = new Map<SectionDefinition, string>();
    const sections: string[] = [];
    let textToSplit = text + '';
    config.sections.forEach((section, index) => {
      const [previousSection, rest] = textToSplit.split(section.beginningMark, 2);

      if (!rest) {
        logger.warn('Could not find section start matching %s', section.beginningMark);
        sections.push('');
        return;
      }

      textToSplit = rest;

      // Skip everything before the first section
      if (index === 0) {
        return;
      }

      sections.push(previousSection);
    });

    // Everything until the end is the last section
    sections.push(textToSplit);

    if (config.sections.length !== sections.length) {
      logger.warn('Found %d sections, but expected to find %d sections', sections.length, config.sections.length);
    }

    config.sections.forEach((section, index) => {
      map.set(section, sections[index]);
    });

    return map;
  }

  private processSection (text: string, sectionDefinition: SectionDefinition): Map<string, string|string[]> {
    let matches = new Map<string, string|string[]>();

    // Only use one kind of dash
    text = text.replace(/[–—]/gi, '-');

    // If we have regular expressions that work over multiple lines, process the entire text
    const multiLineRegExps = sectionDefinition.regexps.filter(regexp => regexp.multiline);
    if (multiLineRegExps.length > 0) {
      const multiLineMatches = this.processText(text, multiLineRegExps);
      matches = this.mergeMatches(matches, multiLineMatches);
    }

    // If we have regular expressions that work on single lines, process the text line by line
    const singleLineRegExps = sectionDefinition.regexps.filter(regexp => !regexp.multiline);
    if (singleLineRegExps.length > 0) {
      const lines = text.split('\n');
      lines.forEach(line => {
        // Remove whitespace from beginning and end of the line
        line = line.trim();

        // Empty lines can be skipped
        if (line === '') {
          return;
        }

        const singleLineMatches = this.processText(line, singleLineRegExps);
        matches = this.mergeMatches(matches, singleLineMatches);
      });
    }

    return matches;
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
    const matches = new Map<string, string>();

    for (const regex of regexps) {
      const match = text.match(regex);
      if (!match) {
        continue;
      }

      if (!match.groups) {
        logger.warn('RegExp %s has no match groups', regex);
        continue;
      }

      for (const [key, value] of Object.entries(match.groups)) {
        if (matches.has(key)) {
          logger.warn('We already have a match for %s', key);
          continue;
        }

        // Groups may be undefined
        if (!value) {
          continue;
        }

        // Collapse multiple newlines into one and remove whitespace and beginning and end
        let sanitizedValue = value.replace(/\n{2,}/m, '\n');
        sanitizedValue = sanitizedValue.trim();
        matches.set(key, sanitizedValue);
      }
    }

    return matches;
  }

  private mergeMatches (matches: Map<string, string|string[]>, newMatches: Map<string, string|string[]>): Map<string, string|string[]> {
    newMatches.forEach((value, key) => {
      if (this.multiValueKeys.includes(key)) {
        let array = (matches.get(key) || []) as string[];
        Array.isArray(value) ? array = array.concat(value) : array.push(value);
        matches.set(key, array);
        return;
      }

      if (matches.has(key)) {
        logger.warn('We already have a value for key %s', key);
        return;
      }

      matches.set(key, value);
    });

    return matches;
  }

  /**
   * This method looks up a match by its key and returns it with all newline characters stripped.
   * Returns an empty string if the key does not exist.
   *
   * @param matches
   * @param key
   * @private
   */
  private getMatchWithoutNewlines (matches: Map<string, string|string[]>, key: string): string {
    const value = matches.get(key) as string || '';
    return value.replace(/\n/, '');
  }
}
