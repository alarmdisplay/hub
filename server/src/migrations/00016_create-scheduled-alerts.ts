import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'scheduled_alerts';

  await query.createTable(tableName, {
    id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    begin: { type: Sequelize.DATE, allowNull: false },
    end: { type: Sequelize.DATE, allowNull: false },
    reason: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    keyword: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    status: { type: Sequelize.ENUM, values: ['Exercise', 'Test'], allowNull: false, defaultValue: 'Test' },
    incidentId: { type: Sequelize.INTEGER, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false }
  });

  await query.addIndex(tableName, { name: 'incidentId', fields: ['incidentId'] });
  await query.addConstraint(tableName, {
    name: `${tableName}_ibfk_1`,
    type: 'foreign key',
    fields: ['incidentId'],
    references: { table: 'incidents', field: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('scheduled_alerts');
};
