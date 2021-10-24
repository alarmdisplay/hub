import path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';
import {Request} from 'express';
import socketio from '@feathersjs/socketio';


import { Application } from './declarations';
import logger from './logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
import authentication from './authentication';
import sequelize from './sequelize';
import fs from "fs";
// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());

// Load app configuration
app.configure(configuration());
app.set('devMode', !process.env.NODE_ENV || process.env.NODE_ENV === 'development');
logger.level = app.get('logging').level;
logger.info('Logging level is \'%s\'', logger.level);

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors<Request>());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Serve the Console UI statically
if (fs.existsSync('ext-console')) {
  app.use('/console', express.static('ext-console'));
} else if (process.env.NODE_ENV === 'production') {
  logger.warn('The static files for the console UI could not be found, the path /console will not work');
}

// Set up a global Promise to check if the database is ready
app.set('databaseReady', new Promise(resolve => {
  app.set('databaseReadyResolve', resolve);
}));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

app.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger } as any));

app.hooks(appHooks);
export default app;
