import Sequelize, {DataTypes, QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'processed_files'].join('_');

    const tableExists = await query.tableExists(tableName);
    if (tableExists) {
      // Exit early if the table exists
      return;
    }

    await query.createTable(tableName, {
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'processed_files'].join('_'));
  }
};
