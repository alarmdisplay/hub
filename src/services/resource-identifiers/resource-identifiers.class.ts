import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, ResourceIdentifierData } from '../../declarations';

export class ResourceIdentifiers extends Service<ResourceIdentifierData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
