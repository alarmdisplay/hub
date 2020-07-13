// Initializes the `textanalysis` service on path `/textanalysis`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { TextAnalysis } from './textanalysis.class';
import hooks from './textanalysis.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'textanalysis': TextAnalysis & ServiceAddons<any>;
  }

  interface Config {
    /**
     * Text before this mark is ignored
     */
    beginningMark: RegExp,

    /**
     * Text after this mark is ignored
     */
    endMark: RegExp,

    /**
     * Definition objects for the different sections of the text
     */
    sections: SectionDefinition[],

    /**
     * List of words that always appear in the text. This is supposed to prevent processing of other texts. If none of
     * the words is found in the text, the processing gets aborted. If the list is empty, the text will always be
     * processed.
     */
    triggerWords: string[]
  }

  interface SectionDefinition {
    /**
     * How to recognize the beginning of this section
     */
    beginningMark: RegExp,

    /**
     * Regular expressions with named capture groups to extract the information
     */
    regexps: RegExp[]
  }
}

export default function (app: Application) {
  // Initialize our service with any options it requires
  app.use('/textanalysis', new TextAnalysis(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('textanalysis');

  service.hooks(hooks);
}
