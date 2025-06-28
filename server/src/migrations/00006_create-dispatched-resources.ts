import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'dispatched_resources';

  const tableExists = await query.tableExists(tableName);
  if (tableExists) {
    // Exit early if the table exists
    return;
  }

  await query.createTable(tableName, {
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
      allowNull: false,
      primaryKey: true
    },
    incidentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  });

  await query.addIndex(tableName, {
    name: 'incidentId',
    fields: ['incidentId']
  });

  await query.addConstraint(tableName, {
    name: `${tableName}_ibfk_1`,
    type: 'foreign key',
    fields: ['resourceId'],
    references: { table: 'resources', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  await query.addConstraint(tableName, {
    name: `${tableName}_ibfk_2`,
    type: 'foreign key',
    fields: ['incidentId'],
    references: { table: 'incidents', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('dispatched_resources');
};
