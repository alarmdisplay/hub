import { Sequelize, DataTypes, Model } from 'sequelize';
import { HookReturn } from 'sequelize/types/hooks';
import { Application } from '../declarations';

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
    },
    tableName: [app.get('db_prefix'), 'resource_identifiers'].join('_')
  });

  (ResourceIdentifier as any).associate = function (models: any): void {
    models.resource_identifier.belongsTo(models.resource, { as: 'resource' });
  };

  return ResourceIdentifier;
}
