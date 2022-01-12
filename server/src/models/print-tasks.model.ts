import { DataTypes, Model, Sequelize } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

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
