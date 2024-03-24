import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application, PrintTaskData, FoundFileContext } from '../../declarations';
import logger from '../../logger';
import cp from 'child_process';

export class PrintTasks extends Service<PrintTaskData> {
  constructor(options: Partial<SequelizeServiceOptions>) {
    super(options);
  }

  setup(app: Application): void {
    // Register to be notified of new files
    const watchedFoldersService = app.service('watchedfolders');
    watchedFoldersService.on('found_file', (context: FoundFileContext) => this.onNewFile(context.path, context.watchedFolderId));
  }

  private async onNewFile(filePath: string, watchedFolderId: number) {
    const printTasks = await this.find({
      query: {
        event: 'found_file',
        sourceId: watchedFolderId,
      },
      paginate: false
    }) as PrintTaskData[];

    for (const printTask of printTasks) {
      let command = 'lp ';

      // Add the printer name, if it is set and doesn't look suspicious
      if (printTask.printerName && printTask.printerName !== '') {
        if (/^\w+$/.test(printTask.printerName)) {
          command += `-d ${printTask.printerName} `;
        } else {
          logger.warn('The printer name contains illegal characters (e.g. space)');
        }
      }

      command += '-o fit-to-page ';

      // If the number of copies is a valid parameter, add it to the command
      if (Number.isInteger(printTask.numberCopies) && printTask.numberCopies > 0 && printTask.numberCopies < 128) {
        command += `-n ${printTask.numberCopies} `;
      }

      // Add the file name
      command += filePath;

      // Execute the command
      try {
        cp.execSync(command, { stdio: 'ignore' });
      } catch (error: any) {
        logger.error(error.message);
      }
    }
  }
}
