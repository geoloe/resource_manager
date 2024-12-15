import { PluginInitializerContext } from '../../../src/core/server';
import { RessourceManagerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new RessourceManagerPlugin(initializerContext);
}

export { RessourceManagerPluginSetup, RessourceManagerPluginStart } from './types';
