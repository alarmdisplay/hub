// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const locations = sequelizeClient.define('locations', {
    rawText: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    detail: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    postCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (locations as any).associate = function (models: any): void {
  };

  return locations;
}
