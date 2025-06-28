import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'settings';

  const tableExists = await query.tableExists(tableName);
  if (tableExists) {
    // Exit early if the table exists
    return;
  }

  await query.createTable(tableName, {
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: Sequelize.JSON,
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
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('settings');
};
