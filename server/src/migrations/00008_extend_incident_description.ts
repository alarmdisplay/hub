import Sequelize, {QueryInterface} from 'sequelize';

export default {
  async up(query: QueryInterface): Promise<void> {
    await query.changeColumn('incidents', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: ''
    });
  },
  async down(query: QueryInterface): Promise<void> {
    await query.changeColumn('incidents', 'description', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  }
};
