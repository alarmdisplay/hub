import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const alerts = sequelizeClient.define('alerts', {
    sender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ref: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caller_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caller_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (alerts as any).associate = function (models: any): void {
    models.alerts.hasMany(models.resource, {
      as: 'resources'
    })
    models.alerts.hasOne(models.locations, {
      as: 'location'
    })
  };

  return alerts;
}
