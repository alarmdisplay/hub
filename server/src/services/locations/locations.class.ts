import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import * as gk from 'gauss-krueger'
import {Application, LocationData, RawLocation} from '../../declarations';
import {Nominatim, NominatimResult} from './nominatim.class';
import logger from '../../logger';

export class Locations extends Service<LocationData> {
  private nominatim: Nominatim
  private readonly app: Application;
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
    this.nominatim = new Nominatim()
  }

  async processRawLocation(rawLocation: RawLocation): Promise<Partial<LocationData>> {
    let fallbackAddress = this.getFallbackAddress(rawLocation)

    let location: Partial<LocationData> = {
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

    // If there are WGS84 coordinates present, try to use them first
    if (rawLocation.wgs84) {
      location.latitude = this.convertToDecimalNumber(rawLocation.wgs84.lat, rawLocation.wgs84.lat_min, rawLocation.wgs84.lat_sec)
      location.longitude = this.convertToDecimalNumber(rawLocation.wgs84.lon, rawLocation.wgs84.lon_min, rawLocation.wgs84.lon_sec)
    }

    // If we have Gauss-Krueger coordinates, try to convert them to WGS coordinates, if not already present in the result
    if (rawLocation.gk && !(location.latitude && location.longitude)) {
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

    // Optionally validate with Nominatim
    let validatedLocation
    if (this.app.get('validate_location')) {
      try {
        validatedLocation = await this.validateWithNominatim(location, rawLocation)
      } catch (error) {
        logger.warn('Error while validating the location with Nominatim, using raw values', error.message || error)
      }
    }

    // If the validation failed or has been skipped, use the raw values
    if (!validatedLocation) {
      location.street = rawLocation.street
      location.number = rawLocation.streetnumber
      location.postCode = rawLocation.zip
      location.locality = rawLocation.city
    }

    location.detail = rawLocation.detail

    return location
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

  async validateWithNominatim(data: Partial<LocationData>, rawData: RawLocation): Promise<Partial<LocationData>> {
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

    // TODO determine best result based on scores or by looking for buildings/addresses with least deviation
    return results[0]
  }

  convertToDecimalNumber(degrees: string, minutes: string, seconds: string): number|undefined {
    let decDegrees = Number.parseFloat(degrees);

    // If the first parameter isn't a number, the rest doesn't make sense
    if (isNaN(decDegrees)) {
      return undefined
    }

    // If the minutes and seconds are empty, we are done
    if (minutes.trim() === '' && seconds.trim() === '') {
      return decDegrees
    }

    let minutesFloat = Number.parseFloat(minutes);
    if (isNaN(minutesFloat)) {
      // The minutes input wasn't empty but invalid
      return undefined
    }
    decDegrees += minutesFloat / 60

    // If the seconds are empty, we are done
    if (seconds.trim() === '') {
      return decDegrees
    }

    let secondsFloat = Number.parseFloat(seconds);
    if (isNaN(secondsFloat)) {
      // The seconds input wasn't empty but invalid
      return undefined
    }
    decDegrees += secondsFloat / 3600

    return decDegrees
  }
}
