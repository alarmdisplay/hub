import {DataTypes, QueryInterface} from 'sequelize';

export default {
  async up(query: QueryInterface): Promise<void> {
    const tableName = 'locations';

    await query.renameColumn(tableName, 'locality', 'municipality');
    await query.addColumn(tableName, 'district', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    });
  },
  async down(query: QueryInterface): Promise<void> {
    const tableName = 'locations';
    await query.removeColumn(tableName, 'district');
    await query.renameColumn(tableName, 'municipality', 'locality');
  }
};
