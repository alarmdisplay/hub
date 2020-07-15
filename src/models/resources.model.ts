import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default function (app: Application) {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const resources = sequelizeClient.define('resource', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['organization', 'group', 'vehicle', 'role', 'other'],
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
    models.resource.hasMany(models.resource_identifier, {
      foreignKey: { allowNull: false },
      as: 'identifiers'
    })
  };

  return resources;
}
