import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'textanalysis';

  const tableExists = await query.tableExists(tableName);
  if (tableExists) {
    // Exit early if the table exists
    return;
  }

  await query.createTable(tableName, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    config: {
      type: Sequelize.STRING,
      allowNull: false
    },
    watchedFolderId: {
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

  await query.addConstraint(tableName, {
    name: 'watchedFolderId',
    type: 'unique',
    fields: ['watchedFolderId']
  });

  await query.addConstraint(tableName, {
    name: `${tableName}_ibfk_1`,
    type: 'foreign key',
    fields: ['watchedFolderId'],
    references: { table: 'watched_folders', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('textanalysis');
};
