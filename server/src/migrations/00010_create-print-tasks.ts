import Sequelize, { DataTypes, QueryInterface } from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'print_tasks'].join('_');

    try {
      await query.describeTable(tableName);
      // Exit early if the table exists
      return;
    } catch (e) {
      // The table does not exist, so we just continue
    }

    await query.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
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
    await query.dropTable([app.get('db_prefix'), 'print_tasks'].join('_'));
  }
};
