import axios from 'axios';
import logger from '../../logger';

export interface NominatimResult {
  place_id: bigint,
  licence: string,
  osm_type: string,
  osm_id: bigint,
  boundingbox: [],
  lat: string,
  lon: string,
  display_name: string,
  class: string,
  type: string,
  importance: number,
  address: {
    house_name?: string,
    house_number: string,
    road: string,
    isolated_dwelling?: string,
    croft?: string,
    hamlet?: string,
    subdivision?: string,
    suburb?: string,
    borough?: string,
    district?: string,
    city_district?: string,
    village?: string,
    town?: string,
    city?: string,
    municipality?: string,
    county: string,
    state: string,
    postcode: string,
    country: string,
    country_code: string
  }
}

export class Nominatim {
  private baseUrl: URL;

  constructor(baseUrl?: URL) {
    this.baseUrl = baseUrl || new URL('https://nominatim.openstreetmap.org');
  }

  geocode(street: string, city: string, postalCode: string): Promise<NominatimResult[]> {
    return axios.get('/search', {
      baseURL: this.baseUrl.toString(),
      headers: {
        'User-Agent': 'Alarmdisplay Hub/1.0.0'
      },
      params: {
        'accept-language': 'de',
        addressdetails: 1,
        countrycodes: 'de',
        format: 'json',
        street: street,
        city: city,
        postalcode: postalCode
      },
      responseType: 'json'
    })
      .then(result => {
        logger.debug(result.data);
        return result.data as NominatimResult[];
      });
  }
}
