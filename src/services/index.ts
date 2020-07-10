import { Application } from '../declarations';
import users from './users/users.service';
import watchedfolders from './watchedfolders/watchedfolders.service';
import uploads from './uploads/uploads.service';
import ocr from './ocr/ocr.service';
import textanalysis from './textanalysis/textanalysis.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(users);
  app.configure(watchedfolders);
  app.configure(uploads);
  app.configure(ocr);
  app.configure(textanalysis);
}
