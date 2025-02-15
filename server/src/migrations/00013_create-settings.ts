import Sequelize, {DataTypes, QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'settings'].join('_');

    const tableExists = await query.tableExists(tableName);
    if (tableExists) {
      // Exit early if the table exists
      return;
    }

    await query.createTable(tableName, {
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      value: {
        type: DataTypes.JSON,
        allowNull: true
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
    await query.dropTable([app.get('db_prefix'), 'settings'].join('_'));
  }
};
