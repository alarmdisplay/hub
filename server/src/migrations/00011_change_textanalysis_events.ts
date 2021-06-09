import Sequelize, {QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'textanalysis'].join('_');

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
  async down(query: QueryInterface, app: Application): Promise<void> {
    let tableName = [app.get('db_prefix'), 'textanalysis'].join('_');

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
      references: { table: [app.get('db_prefix'), 'watched_folders'].join('_'), field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await query.removeColumn(tableName, 'event');
  }
};
