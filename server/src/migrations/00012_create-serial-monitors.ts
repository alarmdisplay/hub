import Sequelize, { DataTypes, QueryInterface } from 'sequelize';

export default {
  async up(query: QueryInterface): Promise<void> {
    await query.createTable('serial_monitors', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      port: {
        type: Sequelize.STRING,
        allowNull: false
      },
      baudRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 9600
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      timeout: {
        type: Sequelize.INTEGER,
        allowNull: false
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
  async down(query: QueryInterface): Promise<void> {
    await query.dropTable('serial_monitors');
  }
};
