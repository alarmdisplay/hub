import Sequelize, {QueryInterface} from 'sequelize';

export default {
  async up(query: QueryInterface): Promise<void> {
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
  },
  async down(query: QueryInterface): Promise<void> {
    await query.dropTable('resources');
  }
};
