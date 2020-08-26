import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, ApiKeyData } from '../../declarations';

export class ApiKeys extends Service<ApiKeyData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
