import { PluginInitializerContext } from '../../../src/core/server';
import { ResourceManagerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new ResourceManagerPlugin(initializerContext);
}

export { ResourceManagerPluginSetup, ResourceManagerPluginStart } from './types';
