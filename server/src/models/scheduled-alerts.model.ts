import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const ScheduledAlert = sequelizeClient.define('scheduled_alert', {
    begin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Exercise', 'Test'],
      allowNull: false,
      defaultValue: 'Test'
    },
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    },
    tableName: [app.get('db_prefix'), 'scheduled_alerts'].join('_')
  });

  (ScheduledAlert as any).associate = function (models: any): void {
    models.scheduled_alert.hasOne(models.incident);
  };

  return ScheduledAlert;
}
