import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import * as gk from 'gauss-krueger'
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

    // If we have Gauss-Krueger coordinates, try to convert them to WGS coordinates
    if (rawLocation.gk) {
      try {
        let gkCoordinates = { x: Number(rawLocation.gk.x), y: Number(rawLocation.gk.y) }
        let wgsCoordinates = gk.toWGS(gkCoordinates)
        logger.debug(wgsCoordinates)
        location.latitude = wgsCoordinates.latitude
        location.longitude = wgsCoordinates.longitude
      } catch (error) {
        logger.warn('Could not convert Gauss-Krueger coordinates:', error.message || error)
      }
    }

    try {
      location = await this.validateWithNominatim(location, rawLocation)
    } catch (error) {
      logger.warn('Error while validating the location with Nominatim, using raw values', error.message || error)

      // Just use the raw values
      location.street = rawLocation.street
      location.number = rawLocation.streetnumber
      location.postCode = rawLocation.zip
      location.locality = rawLocation.city
    }

    location.detail = rawLocation.detail

    return await this.create(location) as LocationData
  }

  /**
   * Try to generate a readable address out of the given raw data.
   *
   * @param rawLocation
   */
  getFallbackAddress(rawLocation: RawLocation): string {
    // For now we assume the address format used in Germany
    let line1 = `${rawLocation.street || ''} ${rawLocation.streetnumber || ''}`
    if (rawLocation.detail !== '') {
      line1 = `${line1}, ${rawLocation.detail}`
    }
    let line2 = `${rawLocation.zip || ''} ${rawLocation.city || ''}`
    return `${line1}\n${line2}`
  }

  async validateWithNominatim(data: LocationData, rawData: RawLocation): Promise<LocationData> {
    const results = await this.nominatim.geocode(`${rawData.streetnumber} ${rawData.street}`, rawData.city, rawData.zip)
    let bestResult = await this.getBestResult(results)

    if (rawData.streetnumber !== '' && (!bestResult.address.house_number || bestResult.address.house_number === '')) {
      throw new Error('The result did not contain a house number, although our query had one')
    }

    // Enhance the location data with bits from the Nominatim response
    data.name = bestResult.address.house_name || ''
    data.street = bestResult.address.road
    data.number = bestResult.address.house_number
    data.postCode = bestResult.address.postcode
    data.locality = bestResult.address.village || bestResult.address.town || bestResult.address.city || bestResult.address.municipality || ''
    data.country = bestResult.address.country_code === 'de' ? 'Deutschland': ''

    // If the coordinates have not been supplied before, use the ones from Nominatim
    if (!data.latitude || !data.longitude) {
      data.latitude = Number(bestResult.lat)
      data.longitude = Number(bestResult.lon)
    }

    return data
  }

  async getBestResult(results: NominatimResult[]): Promise<NominatimResult> {
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error('No results were given')
    }

    return results[0]
  }
}
