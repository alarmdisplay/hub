import Sequelize, { DataTypes, QueryInterface } from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    await query.createTable([app.get('db_prefix'), 'serial_monitors'].join('_'), {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      port: {
        type: Sequelize.STRING,
        allowNull: false
      },
      baudRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 9600
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      timeout: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'serial_monitors'].join('_'));
  }
};
