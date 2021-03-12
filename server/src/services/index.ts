import { Application } from '../declarations';
import users from './users/users.service';
import watchedfolders from './watchedfolders/watchedfolders.service';
import textanalysis from './textanalysis/textanalysis.service';
import resources from './resources/resources.service';
import resourceIdentifiers from './resource-identifiers/resource-identifiers.service';
import locations from './locations/locations.service';
import incidents from './incidents/incidents.service';
import apiKeys from './api-keys/api-keys.service';
import inputPager from './input/pager/pager.service';
import printTasks from './print-tasks/print-tasks.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(users);
  app.configure(watchedfolders);
  app.configure(textanalysis);
  app.configure(resources);
  app.configure(resourceIdentifiers);
  app.configure(locations);
  app.configure(incidents);
  app.configure(apiKeys);
  app.configure(inputPager);
  app.configure(printTasks);
}
