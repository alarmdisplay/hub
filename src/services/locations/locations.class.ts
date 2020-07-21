import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import {Application, LocationData, RawLocation} from '../../declarations';
import {Nominatim, NominatimResult} from './nominatim.class';
import logger from '../../logger';

export class Locations extends Service<LocationData> {
  private nominatim: Nominatim
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.nominatim = new Nominatim()
  }

  async createFromRawLocation(rawLocation: RawLocation): Promise<LocationData> {
    let fallbackAddress = this.getFallbackAddress(rawLocation)

    let location: LocationData = {
      rawText: fallbackAddress,
      latitude: undefined,
      longitude: undefined,
      name: '',
      street: '',
      number: '',
      detail: '',
      postCode: '',
      locality: '',
      country: ''
    };

    try {
      location = await this.validateWithNominatim(location)
    } catch (error) {
      logger.warn('Error while validating the location with Nominatim, using raw values', error.message || error)

      // Just use the raw values
      location.street = rawLocation.street
      location.number = rawLocation.streetnumber
      location.postCode = rawLocation.zip
      location.locality = rawLocation.city
    }

    return await this.create(location) as LocationData
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

  async validateWithNominatim(data: LocationData): Promise<LocationData> {
    const results = await this.nominatim.geocode(data.rawText)
    let bestResult = await this.getBestResult(results)

    // Enhance the location data with bits from the Nominatim response
    data.name = bestResult.address.house_name || ''
    data.street = bestResult.address.road
    data.number = bestResult.address.house_number
    data.postCode = bestResult.address.postcode
    data.locality = bestResult.address.village || bestResult.address.town || bestResult.address.city || bestResult.address.municipality || ''
    data.country = bestResult.address.country_code === 'de' ? 'Deutschland': ''
    data.latitude = Number(bestResult.lat)
    data.longitude = Number(bestResult.lon)

    return data
  }

  async getBestResult(results: NominatimResult[]): Promise<NominatimResult> {
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error('No results were given')
    }

    return results[0]
  }
}
