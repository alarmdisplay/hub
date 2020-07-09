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
    logger.debug('Got input:', text);

    let lines = text.split('\n');
    let sawKeyword = false;

    lines.forEach(function (line) {
      let matches = line.match(/Alarmfax|ILS Augsburg/i);
      if (matches) {
        sawKeyword = true;
      }
    });

    if (!sawKeyword) {
      logger.warn('Did not see keyword');
      return;
    }

    let currentSection: string;
    let einsatzort = {
      strasse: '',
      plz: '',
      ort: ''
    };
    let bemerkungen: string[] = [];
    let alarm: AlertInfo = { time: new Date() }

    lines.forEach(function (line) {
      line = line.trim();

      if (line === '') {
        return;
      }

      // Only use one kind of dash
      line = line.replace(/[–—]/gi, '-');

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
}
