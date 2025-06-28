import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
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
      type: Sequelize.INTEGER,
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
};

export const down: Migration = async ({context: {query}}) => {
  await query.dropTable('serial_monitors');
};
