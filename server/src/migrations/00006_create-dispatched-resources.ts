import Sequelize, {QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'dispatched_resources'].join('_');

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
      references: { table: [app.get('db_prefix'), 'resources'].join('_'), field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await query.addConstraint(tableName, {
      name: `${tableName}_ibfk_2`,
      type: 'foreign key',
      fields: ['incidentId'],
      references: { table: [app.get('db_prefix'), 'incidents'].join('_'), field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'dispatched_resources'].join('_'));
  }
};
