import Sequelize, {DataTypes, QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'scheduled_alerts'].join('_');

    await query.createTable(tableName, {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      begin: { type: DataTypes.DATE, allowNull: false },
      end: { type: DataTypes.DATE, allowNull: false },
      reason: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
      keyword: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
      status: { type: DataTypes.ENUM, values: ['Exercise', 'Test'], allowNull: false, defaultValue: 'Test' },
      incidentId: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await query.addIndex(tableName, { name: 'incidentId', fields: ['incidentId'] });
    await query.addConstraint(tableName, {
      name: `${tableName}_ibfk_1`,
      type: 'foreign key',
      fields: ['incidentId'],
      references: { table: [app.get('db_prefix'), 'incidents'].join('_'), field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'scheduled_alerts'].join('_'));
  }
};
