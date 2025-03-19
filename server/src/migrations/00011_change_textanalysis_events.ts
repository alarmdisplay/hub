import Sequelize, {QueryInterface} from 'sequelize';

export default {
  async up(query: QueryInterface): Promise<void> {
    const tableName = 'textanalysis';

    // Add the new event column and automatically fill it with the default value
    await query.addColumn(tableName, 'event', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'found_file'
    });

    // Transform watchedFolderId column to more general sourceId column
    await query.removeConstraint(tableName, `${tableName}_ibfk_1`);
    await query.removeConstraint(tableName, 'watchedFolderId');
    await query.changeColumn(tableName, 'watchedFolderId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await query.renameColumn(tableName, 'watchedFolderId', 'sourceId');
  },
  async down(query: QueryInterface): Promise<void> {
    const tableName = 'textanalysis';

    // Transform general sourceId column back to watchedFolderId column
    await query.renameColumn(tableName, 'sourceId', 'watchedFolderId');
    await query.changeColumn(tableName, 'watchedFolderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    });
    await query.addConstraint(tableName, {
      name: `${tableName}_ibfk_1`,
      type: 'foreign key',
      fields: ['watchedFolderId'],
      references: { table: 'watched_folders', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await query.removeColumn(tableName, 'event');
  }
};
