import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { RessourceManagerPluginSetup, RessourceManagerPluginStart } from './types';
import { defineRoutes } from './routes';

export class RessourceManagerPlugin
  implements Plugin<RessourceManagerPluginSetup, RessourceManagerPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    // Initialize the plugin logger
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('RessourceManagerPlugin: Setup lifecycle started.');

    // Create the HTTP router for defining API routes
    const router = core.http.createRouter();

    // Define server-side routes
    defineRoutes(router);

    this.logger.debug('RessourceManagerPlugin: Routes have been defined.');

    // Return the setup contract (empty for now)
    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('RessourceManagerPlugin: Start lifecycle started.');

    // Any start-up logic can go here

    this.logger.debug('RessourceManagerPlugin: Start lifecycle completed.');
    return {};
  }

  public stop() {
    this.logger.debug('RessourceManagerPlugin: Stop lifecycle invoked.');

    // Any cleanup logic can go here
  }
}