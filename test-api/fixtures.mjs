import { Resolver } from 'dns/promises'

const serverAddress = process.env.SERVER_URL ? process.env.SERVER_URL : 'http://localhost:3030'

/**
 * Preparations that need to happen, before the tests can start.
 *
 * @return {Promise<void>}
 */
export async function mochaGlobalSetup() {
  console.log('Wait for server...');
  let url = new URL(serverAddress)

  console.log(`Trying to resolve ${url.hostname} ...`)
  const resolver = new Resolver();
  let maxAttempts = 5
  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0) {
      // Wait a bit between attempts
      await sleep(1000)
    }

    try {
      await resolver.resolve(url.hostname)
      break
    } catch (e) {
      // Could not resolve, try again
      if (i === maxAttempts-1) {
        throw e
      }
    }
  }
}

export const mochaHooks = {
  beforeAll(done) {
    this.server = {
      base: serverAddress
    }
    done();
  }
};

async function sleep (duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}
