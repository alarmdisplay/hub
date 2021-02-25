// Initializes the `textanalysis` service on path `/textanalysis`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { TextAnalysis } from './textanalysis.class';
import hooks from './textanalysis.hooks';
import createModel from "../../models/textanalysis.model";

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'textanalysis': TextAnalysis & ServiceAddons<any>;
  }

  interface TextAnalysisData {
    id: number
    config: string
    watchedFolderId: number
  }

  interface TextAnalysisConfig {
    /**
     * The name of the config to be shown to the user
     */
    name: string

    /**
     * Text before this mark is ignored
     */
    beginningMark: RegExp

    /**
     * Text after this mark is ignored
     */
    endMark: RegExp

    /**
     * List of words that should reliably be recognized by OCR. They are passed to the OCR process as a reference which
     * increases the chance of them being recognized correctly. It makes sense to include strings that are used in the
     * RegExps to ensure proper splitting of sections and extraction of information. Trigger words are added to this
     * list automatically.
     */
    importantWords: string[]

    /**
     * Definition objects for the different sections of the text
     */
    sections: SectionDefinition[]

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
    beginningMark: RegExp

    /**
     * Regular expressions with named capture groups to extract the information
     */
    regexps: RegExp[]
  }

  interface TextAnalysisResult {
    sender: string
    ref: string
    caller: {
      name: string
      number: string
    }
    location: RawLocation
    reason: string
    keyword: string
    resources: string[]
    description: string
  }

  interface RawLocation {
    street: string
    streetnumber: string
    detail: string
    zip: string
    city: string
    gk?: GaussKruegerText
  }

  interface GaussKruegerText {
    x: string
    y: string
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app)
  };

  // Initialize our service with any options it requires
  app.use('/textanalysis', new TextAnalysis(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('textanalysis');

  service.hooks(hooks);
}
