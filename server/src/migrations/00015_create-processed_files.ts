import Sequelize, {DataTypes, QueryInterface} from 'sequelize';

export default {
  async up(query: QueryInterface): Promise<void> {
    const tableName = 'processed_files';

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
  async down(query: QueryInterface): Promise<void> {
    await query.dropTable('processed_files');
  }
};
