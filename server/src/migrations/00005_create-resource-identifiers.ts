import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'resource_identifiers';

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
    type: {
      type: Sequelize.ENUM,
      values: ['name', 'selcall'],
      allowNull: false
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    resourceId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  await query.addIndex(tableName, {
    name: 'resourceId',
    fields: ['resourceId']
  });

  await query.addConstraint(tableName, {
    name: `${tableName}_ibfk_1`,
    type: 'foreign key',
    fields: ['resourceId'],
    references: { table: 'resources', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('resource_identifiers');
};
