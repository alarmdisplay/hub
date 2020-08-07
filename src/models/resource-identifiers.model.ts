import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const ResourceIdentifier = sequelizeClient.define('resource_identifier', {
    type: {
      type: DataTypes.ENUM,
      values: ['name', 'selcall'],
      allowNull: false
    },
    value: {
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

  (ResourceIdentifier as any).associate = function (models: any): void {
    models.resource_identifier.belongsTo(models.resource, { as: 'resource' })
  };

  return ResourceIdentifier;
}
