import {AuthenticationBaseStrategy, AuthenticationRequest, AuthenticationResult} from '@feathersjs/authentication';
import { FeathersError, NotAuthenticated } from '@feathersjs/errors';
import bcrypt from 'bcryptjs';
import logger from '../logger';

export class ApiKeyStrategy extends AuthenticationBaseStrategy {
  /**
   * Authenticate
   * @param authentication
   */
  async authenticate(authentication: AuthenticationRequest): Promise<AuthenticationResult> {
    if (authentication.strategy !== 'api-key') {
      throw new Error(`Cannot handle authentication strategy ${authentication.strategy}`);
    }

    const apiKey = authentication['api-key'];
    if (!apiKey || apiKey === '') {
      throw new NotAuthenticated('No API key provided');
    }

    const match = apiKey.match(/^(\d+):(\w{64})$/);
    if (!match) {
      // The API key does not have the expected format
      throw new NotAuthenticated('API key invalid');
    }
    const [,id,token] = match;

    // Get the API key object for the given ID
    if (!this.app) {
      throw new Error('Cannot access main application');
    }
    const ApiKeyService = this.app.service('api-keys');
    let storedApiKey;
    try {
      storedApiKey = await ApiKeyService.get(id);
    } catch (e) {
      if (e instanceof FeathersError) {
        logger.debug(`No API key with ID ${id} found: ${e.message}`);
      } else {
        logger.debug(`No API key with ID ${id} found: ${e}`);
      }
      throw new NotAuthenticated('API key invalid');
    }

    // Compare the submitted token to its hashed version in the database
    if (!await bcrypt.compare(token, storedApiKey.tokenHash)) {
      throw new NotAuthenticated('API key invalid');
    }

    return {
      'api-key': true
    };
  }
}
