import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'locations';

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
    rawText: {
      type: Sequelize.STRING,
      allowNull: false
    },
    latitude: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    street: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    number: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    detail: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    postCode: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    locality: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    incidentId: {
      type: Sequelize.INTEGER,
      allowNull: true
    }
  });

  await query.addIndex(tableName, {
    name: 'incidentId',
    fields: ['incidentId']
  });

  await query.addConstraint(tableName, {
    name: `${tableName}_ibfk_1`,
    type: 'foreign key',
    fields: ['incidentId'],
    references: { table: 'incidents', field: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('locations');
};
