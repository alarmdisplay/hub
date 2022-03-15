import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, ProcessedFilesData } from '../../declarations';

export class ProcessedFiles extends Service<ProcessedFilesData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
