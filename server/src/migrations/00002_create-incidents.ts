import Sequelize, {QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    await query.createTable([app.get('db_prefix'), 'incidents'].join('_'), {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      sender: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      ref: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      caller_name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      caller_number: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      keyword: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      status: {
        type: Sequelize.ENUM,
        values: ['Actual', 'Exercise', 'Test'],
        allowNull: false,
        defaultValue: 'Actual'
      },
      category: {
        type: Sequelize.ENUM,
        values: ['Geo', 'Met', 'Safety', 'Security', 'Rescue', 'Fire', 'Health', 'Env', 'Transport', 'Infra', 'CBRNE', 'Other'],
        allowNull: false,
        defaultValue: 'Other'
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
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'incidents'].join('_'));
  }
};
