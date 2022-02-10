import {DataTypes, Model, Sequelize} from 'sequelize';
import {HookReturn} from 'sequelize/types/hooks';
import {Application} from '../declarations';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const ApiKey = sequelizeClient.define('api_key', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'token_hash'
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    },
    tableName: [app.get('db_prefix'), 'api_keys'].join('_')
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (ApiKey as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return ApiKey;
}
