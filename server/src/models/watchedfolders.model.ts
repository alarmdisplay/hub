// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default function (app: Application) {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const watchedFolders = sequelizeClient.define('watched_folder', {
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    polling: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    },
    tableName: [app.get('db_prefix'), 'watched_folders'].join('_')
  });

  // eslint-disable-next-line no-unused-vars
  (watchedFolders as any).associate = function (models: any) {
    models.watched_folder.hasOne(models.textanalysis)
  };

  return watchedFolders;
}
