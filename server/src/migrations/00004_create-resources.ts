import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  await query.createTable('resources', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM,
      values: ['organization', 'group', 'vehicle', 'role', 'other'],
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
  await query.dropTable('resources');
};
