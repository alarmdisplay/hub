import { DataTypes, Model, Sequelize } from 'sequelize';
import { HookReturn } from 'sequelize/types/hooks';
import { Application } from '../declarations';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const PrintTask = sequelizeClient.define('print_task', {
    event: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sourceId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    printerName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    numberCopies: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    },
    tableName: [app.get('db_prefix'), 'print_tasks'].join('_'),
  });
  return PrintTask;
}
