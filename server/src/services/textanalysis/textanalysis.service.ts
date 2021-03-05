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
     *
     * Available capture group names are:
     * - caller_name: The person who reported the incident
     * - caller_number: A telephone number to contact the person who reported the incident
     * - description: Free text field with details about this incident
     * - keyword: Usually a term of a taxonomy to roughly categorize types of incidents
     * - loc_city: City of the incident location
     * - loc_detail: Additional detail for the incident location (e. g. 1st floor)
     * - loc_gk_x: X component of a Gauss Krueger coordinate of the incident location
     * - loc_gk_y: Y component of a Gauss Krueger coordinate of the incident location
     * - loc_street: The street name of the incident location
     * - loc_streetnumber: The street number of the incident location
     * - loc_zip: Postal code of the incident location
     * - reason: Reason for the incident, usually a refinement of `keyword`
     * - ref: A unique identifier or reference number for the incident
     * - resources: The name or identifier of a requested or dispatched resource
     * - sender: The authority or organization that sent the document
     *
     * RegExps with the multiline modifier are matched against the entire section, while RegExps without the modifier
     * are executed against every single line of the section. Multiline-RegExps are executed before non-multiline
     * RegExps.
     *
     * Capture group names can be used multiple times, but only the first match will be used. This allows for fallback
     * RegExps that match less strictly and can also be combined with the multiline behaviour mentioned above.
     *
     * The exception to this rule is `resources`, which can be matched multiple times, and the values will be appended.
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
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/textanalysis', new TextAnalysis(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('textanalysis');

  service.hooks(hooks);
}
