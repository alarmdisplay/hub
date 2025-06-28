import Sequelize from 'sequelize';
import { Migration } from '../sequelize';

export const up: Migration = async ({context: {query}}) => {
  const tableName = 'locations';

  await query.renameColumn(tableName, 'locality', 'municipality');
  await query.addColumn(tableName, 'district', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  });
};

export const down: Migration = async ({context: {query}}) => {
  const tableName = 'locations';
  await query.removeColumn(tableName, 'district');
  await query.renameColumn(tableName, 'municipality', 'locality');
};
