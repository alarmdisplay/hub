import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import {Application, LocationData, RawLocation} from '../../declarations';
import {DataTypes} from "sequelize";

export class Locations extends Service<LocationData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  createFromRawLocation(rawLocation: RawLocation): Promise<LocationData> {
    let fallbackAddress = this.getFallbackAddress(rawLocation)

    let location = {
      rawText: fallbackAddress,
      latitude: undefined,
      longitude: undefined,
      street: '',
      number: '',
      detail: '',
      postCode: '',
      city: '',
      country: ''
    };

    return this.create(location) as Promise<LocationData>
  }

  /**
   * Try to generate a readable address out of the given raw data.
   *
   * @param rawLocation
   */
  getFallbackAddress(rawLocation: RawLocation): string {
    // For now we assume the address format used in Germany
    return `${rawLocation.street || ''} ${rawLocation.streetnumber || ''}\n${rawLocation.zip || ''} ${rawLocation.city || ''}`
  }
}
