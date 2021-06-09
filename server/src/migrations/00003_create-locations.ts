import Sequelize, {QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'locations'].join('_');

    try {
      await query.describeTable(tableName);
      // Exit early if the table exists
      return;
    } catch (e) {
      // The table does not exist, so we just continue
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
      references: { table: [app.get('db_prefix'), 'incidents'].join('_'), field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'locations'].join('_'));
  }
};
