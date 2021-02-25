// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default function (app: Application) {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const textAnalysis = sequelizeClient.define('textanalysis', {
    config: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    },
    tableName: [app.get('db_prefix'), 'textanalysis'].join('_')
  });

  // eslint-disable-next-line no-unused-vars
  (textAnalysis as any).associate = function (models: any) {
    models.textanalysis.belongsTo(models.watched_folder, {
      foreignKey: {
        name: 'watchedFolderId',
        allowNull: false,
        unique: true
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  };

  return textAnalysis;
}
