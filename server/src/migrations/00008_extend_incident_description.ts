import Sequelize, {QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    await query.changeColumn('incidents', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: ''
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.changeColumn('incidents', 'description', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  }
};
