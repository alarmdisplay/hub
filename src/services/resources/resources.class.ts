import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, ResourceData } from '../../declarations';

export class Resources extends Service<ResourceData> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
