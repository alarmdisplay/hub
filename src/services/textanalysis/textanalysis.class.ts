import { SetupMethod } from '@feathersjs/feathers'
import { Application } from '../../declarations'
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
    let einsatzort = {
      strasse: '',
      plz: '',
      ort: ''
    };
    let bemerkungen: string[] = [];
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

      let sectionStart = line.match(/[-\w]+\s+(MITTEILER|EINSATZORT|ZIELORT|EINSATZGRUND|EINSATZMITTEL|BEMERKUNG|ENDE FAX)\s+[-\w]+/i);

      if (sectionStart) {
        currentSection = sectionStart[1];
        return;
      }

      if (currentSection === 'EINSATZORT') {
        let strasse = line.match(/Straße\s*[:|=](.*)Haus-Nr\.[:|=](.*)$/);
        if (strasse) {
          einsatzort.strasse = strasse[1].trim() + " " + strasse[2].trim();
        }

        let ort = line.match(/Ort\s*[:|=]\s*(\d{5}) (\w+)/);
        if (ort) {
          einsatzort.plz = ort[1];
          einsatzort.ort = ort[2];
        }

        alarm.location = {
          raw: `${einsatzort.strasse}, ${einsatzort.plz} ${einsatzort.ort}`
        }

        let koordinate = line.match(/Koordinate\s*[:|=]\s(\d+[,.]\d+) \/ (\d+[,.]\d+)$/);
        if (koordinate) {
          alarm.location.gk = {
            x: Number.parseFloat(koordinate[1].replace(',', '.')),
            y: Number.parseFloat(koordinate[2].replace(',', '.'))
          };
        }
      }

      if (currentSection === 'EINSATZGRUND') {
        let schlagwort = line.match(/Schlagw\.[:|=]\s(.*)$/);
        if (schlagwort) {
          alarm.title = schlagwort[1];
          let parts = alarm.title.split('#');
          logger.debug(parts);
          if (parts.length > 1) {
            alarm.title = parts.slice(-1)[0];
          }
        }

        let stichwort = line.match(/Stichwort[:|=]\s(.*)$/);
        if (stichwort) {
          alarm.keyword = stichwort[1].replace(/\//g, '').trim();
        }
      }

      if (currentSection === 'EINSATZMITTEL') {
        // TODO
      }

      if (currentSection === 'BEMERKUNG') {
        let leererEinsatzplan = line.match(/Einsatzplan[:|=]/);
        if (!leererEinsatzplan) {
          bemerkungen.push(line);
        }
      }
    });
    alarm.description = bemerkungen.join();

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
