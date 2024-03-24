import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

export class Users extends Service {
  constructor(options: Partial<SequelizeServiceOptions>) {
    super(options);
  }
}
