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
    beginningMark: RegExp,
    endMark: RegExp,
    sections: SectionDefinition[],
    triggerWords: string[]
  }

  interface SectionDefinition {
    beginningMark: RegExp,
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
