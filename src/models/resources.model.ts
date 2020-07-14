import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default function (app: Application) {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const resources = sequelizeClient.define('resource', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });

  (resources as any).associate = function (models: any) {
    models.resource.hasMany(models.resource_identifier, { foreignKey: { allowNull: false } })
  };

  return resources;
}
