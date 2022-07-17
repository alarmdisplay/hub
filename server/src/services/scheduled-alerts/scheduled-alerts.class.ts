import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

interface ScheduledAlertData {
  id: number
  begin: Date
  end: Date
  reason: string
  keyword: string
  status: 'Exercise' | 'Test'
  createdAt: Date
  updatedAt: Date
  incidentId?: number
}

export class ScheduledAlerts extends Service<ScheduledAlertData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
