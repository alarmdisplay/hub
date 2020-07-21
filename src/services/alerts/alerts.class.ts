import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, AlertData } from '../../declarations';

export class Alerts extends Service<AlertData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
