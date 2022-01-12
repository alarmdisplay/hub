// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const SerialMonitor = sequelizeClient.define('serial_monitor', {
    port: {
      type: DataTypes.STRING,
      allowNull: false
    },
    baudRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 9600
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    timeout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    },
    tableName: [app.get('db_prefix'), 'serial_monitors'].join('_')
  });
  return SerialMonitor;
}
