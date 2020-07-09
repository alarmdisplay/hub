import { SetupMethod } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import logger from '../../logger'

export class TextAnalysis implements SetupMethod {
  app: Application;

  constructor (app: Application) {
    this.app = app
  }

  setup(app: Application, path: string): void {

  }

  analyse(text: string) {
    logger.debug('Got input:', text);
  }
}
