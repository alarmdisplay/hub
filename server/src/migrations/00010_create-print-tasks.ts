import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'print_tasks';

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
    event: {
      type: Sequelize.STRING,
      allowNull: false
    },
    sourceId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    printerName: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    },
    numberCopies: {
      type: Sequelize.TINYINT,
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
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('print_tasks');
};
