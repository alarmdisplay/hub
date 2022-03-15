import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, SettingsValue, SettingsData } from '../../declarations';
import logger from '../../logger';

export class Settings extends Service<SettingsData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  setup(app: Application): void {
    const settingDefaults = new Map<string, SettingsValue>([
      ['ignore_processed_files', true],
    ]);

    (app.get('databaseReady') as Promise<void>).then(async () => {
      logger.debug('Checking the settings table');
      for (const [settingKey, settingDefault] of settingDefaults) {
        try {
          await this.get(settingKey);
        } catch {
          // If the setting cannot be found, create it with the default value
          await this.create({ key: settingKey, value: settingDefault });
        }
      }
    });
  }

  async getBooleanValue(key: string): Promise<boolean> {
    const settingsData = await this.get(key);
    return settingsData.value == true;
  }
}
